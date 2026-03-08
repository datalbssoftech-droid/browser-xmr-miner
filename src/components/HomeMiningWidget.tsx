import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Square, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWebSocketMiner } from "@/hooks/useWebSocketMiner";

/** Lightweight mining widget for the homepage — authenticated users can mine inline */
export const HomeMiningWidget = () => {
  const { user } = useAuth();
  const [cpuUsage, setCpuUsage] = useState(50);
  const [threads, setThreads] = useState(Math.max(1, Math.floor((navigator.hardwareConcurrency || 4) / 2)));
  const maxThreads = navigator.hardwareConcurrency || 4;

  const { stats, startMining, stopMining } = useWebSocketMiner({ threads, cpuUsage });

  if (!user) {
    return (
      <div className="stat-card text-center py-10">
        <p className="text-muted-foreground mb-4">Sign in to start mining directly from this page</p>
        <Link to="/register">
          <Button variant="neon">
            <LogIn className="h-4 w-4 mr-2" />
            Create Account & Mine
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="stat-card space-y-5">
      {/* Live stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-muted-foreground">Hashrate</p>
          <p className="text-xl font-bold font-mono">{stats.hashrate} <span className="text-xs text-muted-foreground">H/s</span></p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Shares</p>
          <p className="text-xl font-bold font-mono">{stats.acceptedShares}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Est. Earnings</p>
          <p className="text-xl font-bold font-mono text-primary">
            {(stats.totalHashes * 0.0000001).toFixed(6)} <span className="text-xs">XMR</span>
          </p>
        </div>
      </div>

      {/* Controls */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">CPU Usage</span>
          <span className="font-mono text-primary">{cpuUsage}%</span>
        </div>
        <Slider value={[cpuUsage]} onValueChange={([v]) => setCpuUsage(v)} min={10} max={100} step={10} disabled={stats.isMining} />
      </div>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Threads</span>
          <span className="font-mono text-primary">{threads}/{maxThreads}</span>
        </div>
        <Slider value={[threads]} onValueChange={([v]) => setThreads(v)} min={1} max={maxThreads} step={1} disabled={stats.isMining} />
      </div>

      <div className="flex gap-3">
        {!stats.isMining ? (
          <Button variant="neon" className="flex-1" onClick={startMining}>
            <Play className="h-4 w-4 mr-2" /> Start Mining
          </Button>
        ) : (
          <Button variant="destructive" className="flex-1" onClick={stopMining}>
            <Square className="h-4 w-4 mr-2" /> Stop Mining
          </Button>
        )}
      </div>
    </div>
  );
};
