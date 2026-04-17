// ─────────────────────────────────────────────────────────────────────────────
// Shrimine Mining Proxy — REAL RandomX mining via native xmrig
//
// Per browser WebSocket connection we spawn a dedicated xmrig child process
// configured for that user. We parse its log output for accepted shares and
// poll its built-in HTTP API for hashrate, then forward everything back to
// the browser and persist accepted shares to Supabase.
//
// Requirements on the VPS:
//   - xmrig binary in PATH (e.g. /usr/local/bin/xmrig)
//   - Node.js 20+
// ─────────────────────────────────────────────────────────────────────────────
import 'dotenv/config';
import { WebSocketServer } from 'ws';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const {
  PORT = 8080,
  POOL_HOST = 'pool.supportxmr.com',
  POOL_PORT = 3333,
  POOL_TLS = 'false',
  POOL_WALLET = '',
  POOL_PASSWORD = 'x',
  WORKER_NAME = 'shrimine-web',
  SUPABASE_URL = '',
  SUPABASE_ANON_KEY = '',
  SUPABASE_SERVICE_ROLE_KEY = '',
  REQUIRE_AUTH = 'true',
  PLATFORM_FEE = '2',
  XMRIG_BIN = 'xmrig',
  XMRIG_API_BASE_PORT = '50000',
} = process.env;

const requireAuth = REQUIRE_AUTH === 'true';

// ─── Cached config refreshed from Supabase platform_config ──────────────────
let cachedConfig = {
  pool_wallet: POOL_WALLET,
  pool_url: POOL_HOST,
  pool_port: Number(POOL_PORT),
  pool_tls: POOL_TLS === 'true',
  platform_fee: Number(PLATFORM_FEE),
};

async function refreshConfig() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/platform_config?select=key,value`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    if (!res.ok) return;
    const rows = await res.json();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    cachedConfig = {
      pool_wallet: map.pool_wallet || cachedConfig.pool_wallet,
      pool_url: map.pool_url || cachedConfig.pool_url,
      pool_port: Number(map.pool_port) || cachedConfig.pool_port,
      pool_tls: (map.pool_tls ?? String(cachedConfig.pool_tls)) === 'true',
      platform_fee: Number(map.platform_fee) || cachedConfig.platform_fee,
    };
  } catch (err) {
    console.warn('[config] refresh failed:', err.message);
  }
}
refreshConfig();
setInterval(refreshConfig, 60_000);

// ─── Supabase helpers ────────────────────────────────────────────────────────
async function validateToken(token) {
  if (!token) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const user = await res.json();
    return user?.id ? user : null;
  } catch {
    return null;
  }
}

async function db(path, init = {}) {
  if (!SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        ...(init.headers || {}),
      },
    });
    return res.ok ? res.json() : null;
  } catch (e) {
    console.warn('[db]', path, e.message);
    return null;
  }
}

async function createMiningSession(userId, threads, cpuUsage) {
  const rows = await db('mining_sessions', {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      threads,
      cpu_usage: cpuUsage,
      is_active: true,
      hashrate: 0,
      total_hashes: 0,
    }),
  });
  return rows?.[0]?.id || null;
}

async function updateMiningSession(sessionId, patch) {
  if (!sessionId) return;
  await db(`mining_sessions?id=eq.${sessionId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

async function recordShare(userId, sessionId, share) {
  await db('share_submissions', {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      session_id: sessionId,
      job_id: share.job_id || 'xmrig',
      nonce: share.nonce || 'xmrig',
      result: share.result || 'xmrig',
      difficulty: share.difficulty || 0,
      is_valid: true,
    }),
  });
}

// ─── Port allocation for per-session xmrig HTTP API ─────────────────────────
const usedPorts = new Set();
function allocPort() {
  let p = Number(XMRIG_API_BASE_PORT);
  while (usedPorts.has(p)) p++;
  usedPorts.add(p);
  return p;
}
function freePort(p) {
  usedPorts.delete(p);
}

// ─── HTTP server (health) + WS upgrade ──────────────────────────────────────
const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(
      JSON.stringify({
        ok: true,
        config: cachedConfig,
        active_sessions: usedPorts.size,
        ts: Date.now(),
      }),
    );
    return;
  }
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('Shrimine mining proxy running');
});

const wss = new WebSocketServer({ server: httpServer });

// ─── Per-browser session ────────────────────────────────────────────────────
wss.on('connection', async (ws, req) => {
  const sessionTag = randomUUID().slice(0, 8);
  const url = new URL(req.url, 'http://x');
  const token = url.searchParams.get('token');

  let user = null;
  if (requireAuth) {
    user = await validateToken(token);
    if (!user) {
      try {
        ws.send(JSON.stringify({ type: 'error', message: 'unauthorized' }));
      } catch {}
      ws.close(1008, 'unauthorized');
      return;
    }
  }
  const userId = user?.id || 'anon';
  const userTag = userId.slice(0, 8);
  console.log(`[${sessionTag}] WS connected user=${userTag}`);

  let xmrig = null;
  let apiPort = null;
  let configDir = null;
  let dbSessionId = null;
  let lastHashrate = 0;
  let totalHashes = 0;
  let pollTimer = null;

  const send = (obj) => {
    if (ws.readyState === ws.OPEN) {
      try { ws.send(JSON.stringify(obj)); } catch {}
    }
  };

  const cleanup = async () => {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    if (xmrig && !xmrig.killed) {
      try { xmrig.kill('SIGTERM'); } catch {}
    }
    if (apiPort) { freePort(apiPort); apiPort = null; }
    if (configDir) {
      try { rmSync(configDir, { recursive: true, force: true }); } catch {}
      configDir = null;
    }
    if (dbSessionId) {
      await updateMiningSession(dbSessionId, {
        is_active: false,
        ended_at: new Date().toISOString(),
        hashrate: 0,
        total_hashes: totalHashes,
      });
      dbSessionId = null;
    }
  };

  const startXmrig = async (threads, cpuUsage) => {
    if (xmrig) return; // already running
    if (!cachedConfig.pool_wallet) {
      send({ type: 'error', message: 'pool wallet not configured' });
      return;
    }

    apiPort = allocPort();
    configDir = mkdtempSync(join(tmpdir(), `xmrig-${sessionTag}-`));
    const cfgPath = join(configDir, 'config.json');

    const safeThreads = Math.max(1, Math.min(8, Number(threads) || 1));
    const throttle = Math.max(10, Math.min(100, Number(cpuUsage) || 50));

    const config = {
      autosave: false,
      cpu: {
        enabled: true,
        'huge-pages': false,
        'hw-aes': null,
        priority: null,
        'max-threads-hint': throttle,
        rx: { mode: 'light', '1gb-pages': false },
      },
      'donate-level': 0,
      log: { 'colors': false },
      pools: [
        {
          algo: 'rx/0',
          coin: 'monero',
          url: `${cachedConfig.pool_url}:${cachedConfig.pool_port}`,
          user: cachedConfig.pool_wallet,
          pass: `${WORKER_NAME}-${userTag}`,
          tls: !!cachedConfig.pool_tls,
          keepalive: true,
          'rig-id': `shrimine-${userTag}`,
        },
      ],
      http: { enabled: true, host: '127.0.0.1', port: apiPort, 'access-token': null, restricted: false },
      threads: safeThreads,
    };

    writeFileSync(cfgPath, JSON.stringify(config, null, 2));

    xmrig = spawn(XMRIG_BIN, ['-c', cfgPath], { stdio: ['ignore', 'pipe', 'pipe'] });

    xmrig.on('error', (err) => {
      console.error(`[${sessionTag}] xmrig spawn error:`, err.message);
      send({ type: 'error', message: `xmrig not available: ${err.message}` });
    });

    xmrig.on('exit', (code) => {
      console.log(`[${sessionTag}] xmrig exited code=${code}`);
      xmrig = null;
      send({ type: 'error', message: `xmrig exited (code ${code})` });
    });

    // Parse log for accepted shares (xmrig prints "accepted (N/M) diff D ...")
    const onLine = (line) => {
      if (line.includes('use pool') || line.includes('new job')) {
        send({ type: 'connected' });
      }
      const acc = line.match(/accepted\s+\((\d+)\/(\d+)\)\s+diff\s+(\d+)/i);
      if (acc) {
        const diff = Number(acc[3]) || 0;
        send({ type: 'accepted', diff });
        if (dbSessionId) void recordShare(userId, dbSessionId, { difficulty: diff });
        return;
      }
      const rej = line.match(/rejected.*"([^"]+)"/i);
      if (rej) {
        send({ type: 'rejected', reason: rej[1] });
      }
    };

    let buf = '';
    const handleChunk = (chunk) => {
      buf += chunk.toString();
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (line) onLine(line);
      }
    };
    xmrig.stdout.on('data', handleChunk);
    xmrig.stderr.on('data', handleChunk);

    dbSessionId = await createMiningSession(userId, safeThreads, throttle);
    send({ type: 'connected' });

    // Poll HTTP API for hashrate every 3s
    pollTimer = setInterval(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:${apiPort}/2/summary`);
        if (!res.ok) return;
        const j = await res.json();
        const hr = j?.hashrate?.total?.[0] ?? 0;
        const hashes = j?.results?.hashes_total ?? totalHashes;
        lastHashrate = Math.round(hr);
        totalHashes = hashes;
        send({ type: 'mining', hashrate: lastHashrate, totalHashes });
        if (dbSessionId) {
          void updateMiningSession(dbSessionId, { hashrate: lastHashrate, total_hashes: totalHashes });
        }
      } catch {
        // xmrig API not ready yet
      }
    }, 3000);
  };

  ws.on('message', async (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    if (msg.type === 'start') {
      await startXmrig(msg.threads, msg.cpuUsage);
    } else if (msg.type === 'stop') {
      await cleanup();
      send({ type: 'mining', hashrate: 0, totalHashes });
    } else if (msg.type === 'config') {
      // Restart with new threads/cpu (xmrig has no live reconfig)
      await cleanup();
      await startXmrig(msg.threads, msg.cpuUsage);
    }
  });

  ws.on('close', async () => {
    console.log(`[${sessionTag}] WS closed`);
    await cleanup();
  });
  ws.on('error', async () => { await cleanup(); });
});

httpServer.listen(Number(PORT), () => {
  console.log(`[proxy] listening on http://0.0.0.0:${PORT}`);
  console.log(`[proxy] xmrig bin: ${XMRIG_BIN}`);
});
