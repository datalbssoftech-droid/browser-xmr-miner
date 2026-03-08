import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Cpu, Play, Square, Activity, Wifi, WifiOff, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWebSocketMiner } from "@/hooks/useWebSocketMiner";
import { toast } from "sonner";

// Set this to your mining proxy WebSocket URL when deployed
const PROXY_URL = import.meta.env.VITE_MINING_PROXY_URL || "wss://proxy.harimine.com";

export const MiningControls = () => {
  const { user } = useAuth();
  const [cpuUsage, setCpuUsage] = useState(50);
  const [threads, setThreads] = useState(Math.max(1, Math.floor(navigator.hardwareConcurrency / 2) || 2));
  const [consented, setConsented] = useState(false);
  const maxThreads = navigator.hardwareConcurrency || 4;

  const { stats, startMining: wsStart, stopMining: wsStop } = useWebSocketMiner({
    proxyUrl: PROXY_URL,
    threads,
    cpuUsage,
  });

  const startMining = async () => {
    if (!user) return;

    // Create mining session in DB
    await supabase.from("mining_sessions").insert({
      user_id: user.id,
      threads,
      cpu_usage: cpuUsage,
      is_active: true,
    });

    wsStart();
    toast.success("Mining started!");
  };

  const stopMining = async () => {
    wsStop();

    if (user) {
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
    toast.info("Mining stopped");
  };

  // Consent dialog
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
          <Button variant="neon" onClick={() => setConsented(true)}>
            I Agree — Start Mining
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="stat-card">
        {/* Status Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${stats.isMining ? "bg-success animate-pulse-neon" : "bg-muted-foreground"}`} />
            <span className="font-medium">{stats.isMining ? "Mining Active" : "Mining Stopped"}</span>
          </div>
          <div className="flex items-center gap-2">
            {stats.isConnected ? (
              <Wifi className="h-4 w-4 text-success" />
            ) : (
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            )}
            <Activity className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Connection Status */}
        <div className="mb-4 px-3 py-2 rounded-lg bg-secondary text-xs font-mono text-muted-foreground">
          Status: {stats.status} · Proxy: {PROXY_URL.replace("wss://", "")}
        </div>

        {/* Live Stats */}
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

        {/* CPU Slider */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">CPU Usage</span>
            <span className="font-mono text-primary">{cpuUsage}%</span>
          </div>
          <Slider
            value={[cpuUsage]}
            onValueChange={([v]) => setCpuUsage(v)}
            min={10}
            max={100}
            step={10}
            disabled={stats.isMining}
          />
        </div>

        {/* Thread Selector */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Threads</span>
            <span className="font-mono text-primary">{threads} / {maxThreads}</span>
          </div>
          <Slider
            value={[threads]}
            onValueChange={([v]) => setThreads(v)}
            min={1}
            max={maxThreads}
            step={1}
            disabled={stats.isMining}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {!stats.isMining ? (
            <Button variant="neon" className="flex-1" onClick={startMining}>
              <Play className="h-4 w-4 mr-2" />
              Start Mining
            </Button>
          ) : (
            <Button variant="destructive" className="flex-1" onClick={stopMining}>
              <Square className="h-4 w-4 mr-2" />
              Stop Mining
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
