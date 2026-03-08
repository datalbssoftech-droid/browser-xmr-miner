import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface MiningJob {
  jobId: string;
  blob: string;
  target: string;
  height: number;
}

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
  /** Your mining proxy WebSocket URL, e.g. wss://proxy.harimine.com */
  proxyUrl: string;
  threads: number;
  cpuUsage: number;
  onStatsUpdate?: (stats: MiningStats) => void;
}

/**
 * WebSocket mining hook that connects to a Stratum mining proxy.
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
  proxyUrl,
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

  const [stats, setStats] = useState<MiningStats>({
    hashrate: 0,
    totalHashes: 0,
    acceptedShares: 0,
    rejectedShares: 0,
    isConnected: false,
    isMining: false,
    status: "idle",
  });

  const updateStats = useCallback((partial: Partial<MiningStats>) => {
    setStats((prev) => {
      const next = { ...prev, ...partial };
      onStatsUpdate?.(next);
      return next;
    });
  }, [onStatsUpdate]);

  /** Create Web Workers that would run the WASM miner */
  const spawnWorkers = useCallback(
    (job: MiningJob) => {
      // Terminate existing workers
      workersRef.current.forEach((w) => w.terminate());
      workersRef.current = [];

      for (let i = 0; i < threads; i++) {
        // In production, this Worker would load the RandomX WASM binary
        // and compute hashes against the job blob/target.
        //
        // Example worker script (miner-worker.js):
        //   importScripts('/randomx.wasm.js');
        //   onmessage = (e) => {
        //     const { blob, target, startNonce } = e.data;
        //     // hash loop with throttle based on cpuUsage
        //     while (running) {
        //       const result = randomx_hash(blob, nonce);
        //       hashCount++;
        //       if (meetsTarget(result, target)) {
        //         postMessage({ type: 'share', nonce, result });
        //       }
        //       nonce++;
        //     }
        //   };
        //
        // For now we create a simulated worker using a Blob:
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
                hashCount += hashesPerTick;
                self.postMessage({ type: 'hashCount', count: hashCount });
                
                // Simulate finding a share (~every 500 hashes)
                if (hashCount % 500 < hashesPerTick) {
                  self.postMessage({ 
                    type: 'share', 
                    jobId: e.data.jobId,
                    nonce: (Math.random() * 0xFFFFFFFF >>> 0).toString(16).padStart(8, '0'),
                    result: Array.from({length: 32}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join('')
                  });
                }
                
                // Throttle: higher cpuUsage = shorter delay
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
          } else if (e.data.type === "share" && wsRef.current?.readyState === WebSocket.OPEN) {
            // Submit share to proxy
            wsRef.current.send(
              JSON.stringify({
                type: "submit",
                jobId: e.data.jobId,
                nonce: e.data.nonce,
                result: e.data.result,
              })
            );
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
    if (!session?.access_token) {
      updateStats({ status: "No auth token" });
      return;
    }

    updateStats({ status: "connecting" });

    const ws = new WebSocket(proxyUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      updateStats({ isConnected: true, status: "authenticating" });
      // Authenticate with the proxy
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
              height: msg.height,
            });
            break;

          case "accepted":
            setStats((prev) => ({
              ...prev,
              acceptedShares: prev.acceptedShares + 1,
            }));
            break;

          case "rejected":
            setStats((prev) => ({
              ...prev,
              rejectedShares: prev.rejectedShares + 1,
            }));
            break;

          case "error":
            updateStats({ status: `Error: ${msg.message}` });
            break;
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      updateStats({ isConnected: false, isMining: false, status: "disconnected" });
      // Auto-reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    };

    ws.onerror = () => {
      updateStats({ status: "connection error" });
    };
  }, [proxyUrl, session?.access_token, threads, spawnWorkers, updateStats]);

  /** Start mining */
  const startMining = useCallback(() => {
    connect();

    // Track hashrate every second
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
  }, [connect, threads]);

  /** Stop mining */
  const stopMining = useCallback(() => {
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    // Stop reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    // Terminate workers
    workersRef.current.forEach((w) => {
      w.postMessage({ type: "stop" });
      w.terminate();
    });
    workersRef.current = [];
    // Clear interval
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }
    hashCountRef.current = 0;
    updateStats({ hashrate: 0, isConnected: false, isMining: false, status: "idle" });
  }, [updateStats]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMining();
    };
  }, [stopMining]);

  return { stats, startMining, stopMining };
};
