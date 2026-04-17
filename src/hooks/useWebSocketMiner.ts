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
  isPending: boolean;
  status: string;
}

interface UseWebSocketMinerOptions {
  threads: number;
  cpuUsage: number;
  onStatsUpdate?: (stats: MiningStats) => void;
}

/**
 * Real-mining WebSocket client.
 *
 * Browser is a thin presence/control layer. ALL hashing happens on the
 * VPS proxy via native xmrig (real RandomX, ~3000 H/s/core). The browser:
 *   - Opens authenticated WS to the proxy (token in query string)
 *   - Sends control messages: { type: 'start', threads, cpuUsage }
 *                              { type: 'stop' }
 *   - Receives proxy-reported events:
 *     { type: 'connected' }
 *     { type: 'mining',  hashrate, totalHashes }
 *     { type: 'accepted', diff }
 *     { type: 'rejected', reason }
 *     { type: 'error',   message }
 *
 * NO simulation, NO fake hashes. If the proxy isn't running, status
 * stays "disconnected" and zero stats are reported.
 */
export const useWebSocketMiner = ({
  threads,
  cpuUsage,
  onStatsUpdate,
}: UseWebSocketMinerOptions) => {
  const { session } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const configPollRef = useRef<ReturnType<typeof setInterval>>();
  const startRequestedRef = useRef(false);
  const [proxyUrl, setProxyUrl] = useState<string | null>(null);
  const [proxyEnabled, setProxyEnabled] = useState(false);

  const [stats, setStats] = useState<MiningStats>({
    hashrate: 0,
    totalHashes: 0,
    acceptedShares: 0,
    rejectedShares: 0,
    isConnected: false,
    isMining: false,
    isPending: false,
    status: "idle",
  });

  const updateStats = useCallback(
    (partial: Partial<MiningStats>) => {
      setStats((prev) => {
        const next = { ...prev, ...partial };
        onStatsUpdate?.(next);
        return next;
      });
    },
    [onStatsUpdate],
  );

  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
    if (configPollRef.current) {
      clearInterval(configPollRef.current);
      configPollRef.current = undefined;
    }
  }, []);

  const fetchProxyConfig = useCallback(async () => {
    const { data } = await supabase
      .from("platform_config")
      .select("key, value")
      .in("key", ["proxy_url", "proxy_enabled"]);

    if (data) {
      const map: Record<string, string> = {};
      data.forEach((r) => (map[r.key] = r.value));
      setProxyUrl(map.proxy_url || null);
      setProxyEnabled(map.proxy_enabled === "true");
    }
  }, []);

  useEffect(() => {
    void fetchProxyConfig();
  }, [fetchProxyConfig]);

  const connect = useCallback(() => {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    if (!proxyUrl || !proxyEnabled) {
      updateStats({
        isConnected: false,
        isMining: false,
        isPending: true,
        status: "mining proxy disabled",
      });
      return;
    }

    if (!session?.access_token) {
      updateStats({
        isConnected: false,
        isMining: false,
        isPending: true,
        status: "sign in required",
      });
      return;
    }

    updateStats({
      isConnected: false,
      isMining: false,
      isPending: true,
      status: "connecting to mining proxy",
    });

    const url = `${proxyUrl}${proxyUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(session.access_token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      updateStats({
        isConnected: true,
        isPending: true,
        status: "starting xmrig worker",
      });
      ws.send(JSON.stringify({ type: "start", threads, cpuUsage }));
    };

    ws.onmessage = (event) => {
      let msg: { type: string; [k: string]: unknown };
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (msg.type) {
        case "connected":
          updateStats({ isConnected: true, isPending: true, status: "pool authorized" });
          break;

        case "mining":
          updateStats({
            isMining: true,
            isPending: false,
            isConnected: true,
            status: "mining",
            hashrate: Number(msg.hashrate) || 0,
            totalHashes: Number(msg.totalHashes) || 0,
          });
          break;

        case "accepted":
          setStats((prev) => {
            const next = { ...prev, acceptedShares: prev.acceptedShares + 1 };
            onStatsUpdate?.(next);
            return next;
          });
          break;

        case "rejected":
          setStats((prev) => {
            const next = { ...prev, rejectedShares: prev.rejectedShares + 1 };
            onStatsUpdate?.(next);
            return next;
          });
          break;

        case "error":
          updateStats({
            isMining: false,
            isPending: true,
            status: `error: ${String(msg.message ?? "unknown")}`,
          });
          break;
      }
    };

    ws.onclose = () => {
      if (wsRef.current === ws) wsRef.current = null;

      if (startRequestedRef.current) {
        updateStats({
          hashrate: 0,
          isConnected: false,
          isMining: false,
          isPending: true,
          status: "disconnected — retrying",
        });
        reconnectTimeoutRef.current = setTimeout(() => {
          if (startRequestedRef.current) connect();
        }, 5000);
      } else {
        updateStats({
          hashrate: 0,
          isConnected: false,
          isMining: false,
          isPending: false,
          status: "idle",
        });
      }
    };

    ws.onerror = () => {
      updateStats({
        isConnected: false,
        isMining: false,
        isPending: true,
        status: "proxy connection failed",
      });
    };
  }, [proxyUrl, proxyEnabled, session?.access_token, threads, cpuUsage, updateStats, onStatsUpdate]);

  // Push throttle/thread changes to a running session
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && stats.isMining) {
      wsRef.current.send(JSON.stringify({ type: "config", threads, cpuUsage }));
    }
  }, [threads, cpuUsage, stats.isMining]);

  // Auto-reconnect when config arrives after Start was clicked
  useEffect(() => {
    if (
      startRequestedRef.current &&
      proxyEnabled &&
      proxyUrl &&
      session?.access_token &&
      !wsRef.current
    ) {
      connect();
    }
  }, [connect, proxyEnabled, proxyUrl, session?.access_token]);

  const startMining = useCallback(() => {
    if (startRequestedRef.current) return;
    startRequestedRef.current = true;
    clearTimers();

    configPollRef.current = setInterval(() => {
      if (startRequestedRef.current && !wsRef.current) {
        void fetchProxyConfig();
      }
    }, 5000);

    updateStats({
      hashrate: 0,
      totalHashes: 0,
      acceptedShares: 0,
      rejectedShares: 0,
      isConnected: false,
      isMining: false,
      isPending: true,
      status: "starting",
    });

    void fetchProxyConfig();
    connect();
  }, [clearTimers, connect, fetchProxyConfig, updateStats]);

  const stopMining = useCallback(() => {
    startRequestedRef.current = false;
    clearTimers();

    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "stop" }));
        }
      } catch {
        // ignore
      }
      const sock = wsRef.current;
      wsRef.current = null;
      sock.close();
    }

    updateStats({
      hashrate: 0,
      isConnected: false,
      isMining: false,
      isPending: false,
      status: "idle",
    });
  }, [clearTimers, updateStats]);

  useEffect(() => () => stopMining(), [stopMining]);

  return { stats, startMining, stopMining, proxyUrl, proxyEnabled, refetchConfig: fetchProxyConfig };
};
