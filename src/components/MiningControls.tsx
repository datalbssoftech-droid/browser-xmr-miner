import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Cpu, Play, Square, Activity, Wifi, WifiOff, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWebSocketMiner } from "@/hooks/useWebSocketMiner";
import { HashrateGraph, useHashrateHistory, type HashrateDataPoint } from "@/components/HashrateGraph";
import { toast } from "sonner";

export const MiningControls = () => {
  const { user } = useAuth();
  const [cpuUsage, setCpuUsage] = useState(50);
  const [threads, setThreads] = useState(Math.max(1, Math.floor(navigator.hardwareConcurrency / 2) || 2));
  const [consented, setConsented] = useState(() => localStorage.getItem("mining_consent") === "true");
  const [graphData, setGraphData] = useState<HashrateDataPoint[]>([]);
  const maxThreads = navigator.hardwareConcurrency || 4;
  const prevSharesRef = useRef(0);
  const graphIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const sessionOpenedRef = useRef(false);

  const { addPoint, clear: clearHistory } = useHashrateHistory(120);

  const { stats, startMining: wsStart, stopMining: wsStop, proxyUrl, proxyEnabled } = useWebSocketMiner({
    threads,
    cpuUsage,
  });

  const isBusy = stats.isMining || stats.isPending;

  useEffect(() => {
    if (stats.isMining || stats.hashrate > 0) {
      graphIntervalRef.current = setInterval(() => {
        const newShares = stats.acceptedShares - prevSharesRef.current;
        prevSharesRef.current = stats.acceptedShares;
        const updated = addPoint(stats.hashrate, newShares);
        setGraphData(updated);
      }, 1000);
    } else if (graphIntervalRef.current) {
      clearInterval(graphIntervalRef.current);
    }

    return () => {
      if (graphIntervalRef.current) clearInterval(graphIntervalRef.current);
    };
  }, [stats.isMining, stats.hashrate, stats.acceptedShares, addPoint]);

  useEffect(() => {
    const openMiningSession = async () => {
      if (!user || !stats.isMining || sessionOpenedRef.current) return;

      sessionOpenedRef.current = true;
      const { error } = await supabase.from("mining_sessions").insert({
        user_id: user.id,
        threads,
        cpu_usage: cpuUsage,
        is_active: true,
      });

      if (error) {
        sessionOpenedRef.current = false;
        toast.error("Failed to record mining session");
      }
    };

    void openMiningSession();
  }, [cpuUsage, stats.isMining, threads, user]);

  const startMining = async () => {
    if (!user || isBusy) return;

    clearHistory();
    setGraphData([]);
    prevSharesRef.current = 0;
    sessionOpenedRef.current = false;

    wsStart();
    toast.info("Connecting to mining proxy...");
  };

  const stopMining = async () => {
    wsStop();

    if (user && sessionOpenedRef.current) {
      await supabase
        .from("mining_sessions")
        .update({
          is_active: false,
          ended_at: new Date().toISOString(),
          total_hashes: stats.totalHashes,
          hashrate: 0,
        })
        .eq("user_id", user.id)
        .eq("is_active", true);
    }

    sessionOpenedRef.current = false;
    toast.info(stats.isPending ? "Mining request cancelled" : "Mining stopped");
  };

  if (!consented) {
    return (
      <div className="stat-card max-w-lg mx-auto text-center">
        <Cpu className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-2">Mining Consent Required</h3>
        <p className="text-sm text-muted-foreground mb-6">
          This will use your CPU to mine Monero (XMR). This may increase CPU usage and power consumption.
          You can adjust CPU usage and stop mining at any time.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            variant="neon"
            onClick={() => {
              localStorage.setItem("mining_consent", "true");
              setConsented(true);
            }}
          >
            I Agree — Start Mining
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`h-3 w-3 rounded-full ${
                stats.isMining
                  ? "bg-success animate-pulse-neon"
                  : stats.isPending
                    ? "bg-warning animate-pulse"
                    : "bg-muted-foreground"
              }`}
            />
            <span className="font-medium">
              {stats.isMining ? "Mining Active" : stats.isPending ? (stats.status || "Connecting...") : "Mining Stopped"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {stats.isConnected ? <Wifi className="h-4 w-4 text-success" /> : <WifiOff className="h-4 w-4 text-muted-foreground" />}
            <Activity className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="mb-4 px-3 py-2 rounded-lg bg-secondary text-xs font-mono text-muted-foreground flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full shrink-0 ${stats.isMining ? "bg-success" : stats.isPending ? "bg-warning" : "bg-muted-foreground"}`} />
          <span className="truncate">
            {proxyEnabled
              ? `Proxy: ${proxyUrl?.replace("wss://", "").replace("ws://", "") || "not set"} · ${stats.status}`
              : `Proxy setup pending · ${stats.status}`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-xs text-muted-foreground">Hashrate</p>
            <p className="text-2xl font-bold font-mono">
              {stats.hashrate} <span className="text-sm text-muted-foreground">H/s</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Hashes</p>
            <p className="text-2xl font-bold font-mono">{stats.totalHashes.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-success" /> Accepted
            </p>
            <p className="text-2xl font-bold font-mono">{stats.acceptedShares}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <XCircle className="h-3 w-3 text-destructive" /> Rejected
            </p>
            <p className="text-2xl font-bold font-mono">{stats.rejectedShares}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">CPU Usage</span>
            <span className="font-mono text-primary">{cpuUsage}%</span>
          </div>
          <Slider value={[cpuUsage]} onValueChange={([value]) => setCpuUsage(value)} min={10} max={100} step={10} disabled={isBusy} />
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Threads</span>
            <span className="font-mono text-primary">{threads} / {maxThreads}</span>
          </div>
          <Slider value={[threads]} onValueChange={([value]) => setThreads(value)} min={1} max={maxThreads} step={1} disabled={isBusy} />
        </div>

        <div className="flex gap-3">
          {!isBusy ? (
            <Button variant="neon" className="flex-1" onClick={startMining}>
              <Play className="h-4 w-4 mr-2" />
              Start Mining
            </Button>
          ) : (
            <Button variant="destructive" className="flex-1" onClick={stopMining}>
              <Square className="h-4 w-4 mr-2" />
              {stats.isPending ? "Cancel Waiting" : "Stop Mining"}
            </Button>
          )}
        </div>
      </div>

      <HashrateGraph data={graphData} maxPoints={120} />
    </div>
  );
};