import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Cpu, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useXmrMarketData } from "@/hooks/useXmrMarketData";

const BenchmarkPage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [hashrate, setHashrate] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [totalOps, setTotalOps] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const { data } = useXmrMarketData();

  const price = data?.market?.price ?? 0;
  const difficulty = data?.network?.difficulty ?? 300_000_000_000;

  const startBenchmark = () => {
    setIsRunning(true);
    setHashrate(0);
    setElapsed(0);
    setTotalOps(0);
    startTimeRef.current = Date.now();

    // Simulate CPU-intensive work to estimate hashing speed
    let ops = 0;
    intervalRef.current = window.setInterval(() => {
      const start = performance.now();
      // Do some CPU work (simple hash-like computation)
      let hash = 0;
      for (let i = 0; i < 100000; i++) {
        hash = ((hash << 5) - hash + i) | 0;
      }
      const duration = performance.now() - start;
      // Estimate H/s based on computational speed
      // RandomX is ~1000x slower than simple ops, so we scale down
      const estimatedHps = Math.round((100000 / duration) * 0.8);
      ops += estimatedHps;
      setTotalOps(ops);

      const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
      setElapsed(elapsedSec);
      setHashrate(Math.round(ops / elapsedSec));
    }, 1000);
  };

  const stopBenchmark = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    // Auto-stop after 30s
    if (isRunning && elapsed >= 30) {
      stopBenchmark();
    }
  }, [elapsed, isRunning]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const dailyXmr = difficulty > 0 ? (hashrate * 86400) / (difficulty * 2) : 0;
  const dailyUsd = dailyXmr * price;

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Cpu className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold font-display text-glow">HARIMINE</span>
          </Link>
          <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button></Link>
        </div>
      </header>
      <main className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2 flex items-center gap-3">
            <Cpu className="h-8 w-8 text-primary" />
            CPU Benchmark
          </h1>
          <p className="text-muted-foreground mb-8">Test your CPU mining performance and see estimated earnings.</p>

          <div className="stat-card text-center mb-6">
            <p className="text-6xl font-bold font-mono text-primary mb-2">
              {hashrate.toLocaleString()}
            </p>
            <p className="text-muted-foreground font-mono">H/s (estimated)</p>
            <p className="text-sm text-muted-foreground mt-2">
              {isRunning ? `Running... ${Math.round(elapsed)}s / 30s` : elapsed > 0 ? "Benchmark complete" : "Click Start to begin"}
            </p>
            <div className="mt-4">
              {!isRunning ? (
                <Button variant="neon" size="lg" onClick={startBenchmark} className="font-display">
                  <Play className="h-5 w-5 mr-2" /> Start Benchmark
                </Button>
              ) : (
                <Button variant="destructive" size="lg" onClick={stopBenchmark} className="font-display">
                  <Square className="h-5 w-5 mr-2" /> Stop
                </Button>
              )}
            </div>
          </div>

          {hashrate > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="stat-card text-center">
                <p className="text-xs text-muted-foreground">Est. Daily XMR</p>
                <p className="text-xl font-bold font-mono text-primary">{dailyXmr.toFixed(6)}</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-xs text-muted-foreground">Est. Daily USD</p>
                <p className="text-xl font-bold font-mono">${dailyUsd.toFixed(4)}</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-xs text-muted-foreground">Monthly XMR</p>
                <p className="text-xl font-bold font-mono text-primary">{(dailyXmr * 30).toFixed(6)}</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-xs text-muted-foreground">Monthly USD</p>
                <p className="text-xl font-bold font-mono">${(dailyUsd * 30).toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BenchmarkPage;
