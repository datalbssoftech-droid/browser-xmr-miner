// ─────────────────────────────────────────────────────────────────────────────
// Shrimine Mining Proxy
// Browser (WebSocket JSON)  ⇄  Proxy  ⇄  Monero Stratum Pool (TCP/TLS)
// ─────────────────────────────────────────────────────────────────────────────
import 'dotenv/config';
import { WebSocketServer } from 'ws';
import { createServer } from 'node:http';
import net from 'node:net';
import tls from 'node:tls';
import { randomUUID } from 'node:crypto';

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
  REQUIRE_AUTH = 'true',
  PLATFORM_FEE = '2',
} = process.env;

const useTls = POOL_TLS === 'true';
const requireAuth = REQUIRE_AUTH === 'true';

// ─── Cached config from Supabase platform_config ─────────────────────────────
let cachedConfig = {
  pool_wallet: POOL_WALLET,
  pool_url: POOL_HOST,
  pool_port: Number(POOL_PORT),
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
      platform_fee: Number(map.platform_fee) || cachedConfig.platform_fee,
    };
    console.log('[config] refreshed:', cachedConfig);
  } catch (err) {
    console.warn('[config] refresh failed:', err.message);
  }
}
refreshConfig();
setInterval(refreshConfig, 60_000);

// ─── JWT validation via Supabase ─────────────────────────────────────────────
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

// ─── HTTP server (health check + WS upgrade) ─────────────────────────────────
const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, config: cachedConfig, ts: Date.now() }));
    return;
  }
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('Shrimine mining proxy is running');
});

const wss = new WebSocketServer({ server: httpServer });
console.log(`[proxy] starting on :${PORT} → ${cachedConfig.pool_url}:${cachedConfig.pool_port} (tls=${useTls})`);

// ─── Per-client session ──────────────────────────────────────────────────────
wss.on('connection', async (ws, req) => {
  const sessionId = randomUUID().slice(0, 8);
  const url = new URL(req.url, 'http://x');
  const token = url.searchParams.get('token');

  let user = null;
  if (requireAuth) {
    user = await validateToken(token);
    if (!user) {
      ws.send(JSON.stringify({ type: 'error', message: 'unauthorized' }));
      ws.close(1008, 'unauthorized');
      return;
    }
  }
  const userId = user?.id || 'anon';
  console.log(`[${sessionId}] connected user=${userId}`);

  // ── Connect to upstream Stratum pool ──
  const sock = useTls
    ? tls.connect({ host: cachedConfig.pool_url, port: cachedConfig.pool_port, servername: cachedConfig.pool_url })
    : net.connect({ host: cachedConfig.pool_url, port: cachedConfig.pool_port });

  let buf = '';
  let nextId = 1;
  const pending = new Map(); // stratum id → browser id
  let loginId = null;

  const sendBrowser = (obj) => { if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj)); };
  const sendPool = (obj) => sock.write(JSON.stringify(obj) + '\n');

  sock.on('connect', () => {
    console.log(`[${sessionId}] pool connected`);
    loginId = nextId++;
    sendPool({
      id: loginId,
      method: 'login',
      params: {
        login: cachedConfig.pool_wallet,
        pass: `${WORKER_NAME}-${userId.slice(0, 8)}`,
        agent: 'shrimine-proxy/1.0',
      },
    });
  });

  sock.on('data', (chunk) => {
    buf += chunk.toString();
    let idx;
    while ((idx = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line) continue;
      let msg;
      try { msg = JSON.parse(line); } catch { continue; }

      // Login response → forward initial job
      if (msg.id === loginId && msg.result?.job) {
        sendBrowser({ type: 'job', job: msg.result.job, sessionId: msg.result.id });
        continue;
      }
      // Push job from pool
      if (msg.method === 'job' && msg.params) {
        sendBrowser({ type: 'job', job: msg.params });
        continue;
      }
      // Share submit response
      if (pending.has(msg.id)) {
        const browserId = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) sendBrowser({ type: 'rejected', id: browserId, error: msg.error });
        else sendBrowser({ type: 'accepted', id: browserId });
        continue;
      }
    }
  });

  sock.on('error', (err) => {
    console.warn(`[${sessionId}] pool error:`, err.message);
    sendBrowser({ type: 'error', message: 'pool connection error' });
  });
  sock.on('close', () => {
    console.log(`[${sessionId}] pool closed`);
    ws.close();
  });

  // ── Browser → proxy ──
  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    if (msg.type === 'submit' && msg.share) {
      const stratumId = nextId++;
      pending.set(stratumId, msg.id);
      sendPool({
        id: stratumId,
        method: 'submit',
        params: {
          id: msg.share.session_id || loginId,
          job_id: msg.share.job_id,
          nonce: msg.share.nonce,
          result: msg.share.result,
        },
      });
    }
  });

  ws.on('close', () => {
    console.log(`[${sessionId}] browser closed`);
    sock.destroy();
  });
  ws.on('error', () => sock.destroy());
});

httpServer.listen(Number(PORT), () => {
  console.log(`[proxy] listening on http://0.0.0.0:${PORT}`);
});
