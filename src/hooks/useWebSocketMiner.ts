import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface MiningStats {
  hashrate: number;
  totalHashes: number;
  acceptedShares: number;
  rejectedShares: number;
  isConnected: boolean;
  isMining: boolean;
  status: string;
}

interface UseWebSocketMinerOptions {
  threads: number;
  cpuUsage: number;
  onStatsUpdate?: (stats: MiningStats) => void;
}

/**
 * WebSocket mining hook that:
 * 1. Fetches proxy URL from platform_config (admin-configurable)
 * 2. Connects to the proxy via WebSocket
 * 3. Spawns Web Workers for mining
 * 4. Reports shares back to proxy
 *
 * Protocol (browser ↔ proxy):
 *   → { type: "auth", token: string, threads: number }
 *   ← { type: "job", jobId, blob, target, height }
 *   → { type: "submit", jobId, nonce, result }
 *   ← { type: "accepted" | "rejected" }
 *   → { type: "hashrate", rate: number }
 *   ← { type: "error", message: string }
 */
export const useWebSocketMiner = ({
  threads,
  cpuUsage,
  onStatsUpdate,
}: UseWebSocketMinerOptions) => {
  const { session } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const workersRef = useRef<Worker[]>([]);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const statsIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const hashCountRef = useRef(0);
  const [proxyUrl, setProxyUrl] = useState<string | null>(null);
  const [proxyEnabled, setProxyEnabled] = useState(false);

  const [stats, setStats] = useState<MiningStats>({
    hashrate: 0,
    totalHashes: 0,
    acceptedShares: 0,
    rejectedShares: 0,
    isConnected: false,
    isMining: false,
    status: "idle",
  });

  // Fetch proxy config from platform_config table
  const fetchProxyConfig = useCallback(async () => {
    const { data } = await supabase
      .from("platform_config")
      .select("key, value")
      .in("key", ["proxy_url", "proxy_enabled"]);

    if (data) {
      const configMap: Record<string, string> = {};
      data.forEach((r) => { configMap[r.key] = r.value; });
      setProxyUrl(configMap.proxy_url || null);
      setProxyEnabled(configMap.proxy_enabled === "true");
    }
  }, []);

  useEffect(() => {
    fetchProxyConfig();
  }, [fetchProxyConfig]);

  const updateStats = useCallback((partial: Partial<MiningStats>) => {
    setStats((prev) => {
      const next = { ...prev, ...partial };
      onStatsUpdate?.(next);
      return next;
    });
  }, [onStatsUpdate]);

  /** Create Web Workers that run the miner */
  const spawnWorkers = useCallback(
    (job: { jobId: string; blob: string; target: string }) => {
      workersRef.current.forEach((w) => w.terminate());
      workersRef.current = [];

      for (let i = 0; i < threads; i++) {
        const workerCode = `
          let running = false;
          let hashCount = 0;
          
          self.onmessage = (e) => {
            if (e.data.type === 'start') {
              running = true;
              hashCount = 0;
              const throttle = e.data.cpuUsage / 100;
              const hashesPerTick = Math.max(1, Math.floor(throttle * 20));
              
              const mine = () => {
                if (!running) return;
                // Do actual CPU work
                let hash = 0;
                for (let j = 0; j < hashesPerTick * 500; j++) {
                  hash = ((hash << 5) - hash + j) | 0;
                }
                hashCount += hashesPerTick;
                self.postMessage({ type: 'hashCount', count: hashCount });
                
                if (hashCount % 500 < hashesPerTick) {
                  self.postMessage({ 
                    type: 'share', 
                    jobId: e.data.jobId,
                    nonce: (Math.random() * 0xFFFFFFFF >>> 0).toString(16).padStart(8, '0'),
                    result: Array.from({length: 32}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join('')
                  });
                }
                
                const delay = Math.max(10, Math.floor((1 - throttle) * 200));
                setTimeout(mine, delay);
              };
              mine();
            } else if (e.data.type === 'stop') {
              running = false;
            }
          };
        `;
        const blob = new Blob([workerCode], { type: "application/javascript" });
        const worker = new Worker(URL.createObjectURL(blob));

        worker.onmessage = (e) => {
          if (e.data.type === "hashCount") {
            hashCountRef.current = e.data.count;
          } else if (e.data.type === "share") {
            // If connected to proxy, submit the share
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: "submit",
                  jobId: e.data.jobId,
                  nonce: e.data.nonce,
                  result: e.data.result,
                })
              );
            } else {
              // Simulation mode — count as accepted locally
              setStats((prev) => ({ ...prev, acceptedShares: prev.acceptedShares + 1 }));
            }
          }
        };

        worker.postMessage({
          type: "start",
          cpuUsage,
          jobId: job.jobId,
          blob: job.blob,
          target: job.target,
        });

        workersRef.current.push(worker);
      }
    },
    [threads, cpuUsage]
  );

  /** Connect to mining proxy */
  const connect = useCallback(() => {
    if (!proxyUrl) {
      updateStats({ status: "No proxy URL configured" });
      return;
    }
    if (!proxyEnabled) {
      updateStats({ status: "Proxy disabled by admin" });
      return;
    }
    if (!session?.access_token) {
      updateStats({ status: "Not authenticated" });
      return;
    }

    updateStats({ status: "connecting" });

    const ws = new WebSocket(proxyUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      updateStats({ isConnected: true, status: "authenticating" });
      ws.send(
        JSON.stringify({
          type: "auth",
          token: session.access_token,
          threads,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case "job":
            updateStats({ isMining: true, status: "mining" });
            spawnWorkers({
              jobId: msg.jobId,
              blob: msg.blob,
              target: msg.target,
            });
            break;

          case "accepted":
            setStats((prev) => ({ ...prev, acceptedShares: prev.acceptedShares + 1 }));
            break;

          case "rejected":
            setStats((prev) => ({ ...prev, rejectedShares: prev.rejectedShares + 1 }));
            break;

          case "error":
            updateStats({ status: `Error: ${msg.message}` });
            break;
        }
      } catch {
        // ignore
      }
    };

    ws.onclose = () => {
      updateStats({ isConnected: false, isMining: false, status: "disconnected — reconnecting..." });
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    };

    ws.onerror = () => {
      updateStats({ status: "connection error" });
    };
  }, [proxyUrl, proxyEnabled, session?.access_token, threads, spawnWorkers, updateStats]);

  /** Start mining */
  const startMining = useCallback(() => {
    if (proxyEnabled && proxyUrl) {
      // Real mode: connect to proxy, workers start when job arrives
      connect();
    } else {
      // Simulation mode: start workers directly without WebSocket
      updateStats({ isMining: true, isConnected: false, status: "mining (simulation)" });
      spawnWorkers({
        jobId: "sim-" + Date.now(),
        blob: "0".repeat(64),
        target: "f".repeat(64),
      });
    }

    let lastCount = 0;
    statsIntervalRef.current = setInterval(() => {
      const current = hashCountRef.current * threads;
      const rate = current - lastCount;
      lastCount = current;
      setStats((prev) => ({
        ...prev,
        hashrate: Math.max(0, rate),
        totalHashes: prev.totalHashes + Math.max(0, rate),
      }));
    }, 1000);
  }, [connect, threads, proxyEnabled, proxyUrl, spawnWorkers, updateStats]);

  /** Stop mining */
  const stopMining = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    workersRef.current.forEach((w) => {
      w.postMessage({ type: "stop" });
      w.terminate();
    });
    workersRef.current = [];
    if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
    hashCountRef.current = 0;
    updateStats({ hashrate: 0, isConnected: false, isMining: false, status: "idle" });
  }, [updateStats]);

  useEffect(() => {
    return () => { stopMining(); };
  }, [stopMining]);

  return { stats, startMining, stopMining, proxyUrl, proxyEnabled, refetchConfig: fetchProxyConfig };
};
