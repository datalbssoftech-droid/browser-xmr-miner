import { Link } from "react-router-dom";
import { ArrowLeft, Cpu, Activity, Gauge, Box, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useXmrMarketData } from "@/hooks/useXmrMarketData";

const formatHashrate = (h: number) => {
  if (h >= 1e9) return `${(h / 1e9).toFixed(2)} GH/s`;
  if (h >= 1e6) return `${(h / 1e6).toFixed(2)} MH/s`;
  if (h >= 1e3) return `${(h / 1e3).toFixed(2)} KH/s`;
  return `${h.toFixed(0)} H/s`;
};

const NetworkExplorerPage = () => {
  const { data, isLoading } = useXmrMarketData();
  const net = data?.network;
  const market = data?.market;

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
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">Monero Network Explorer</h1>
          <p className="text-muted-foreground mb-8">Real-time Monero blockchain statistics.</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Activity, label: "Network Hashrate", value: net?.hashrate ? formatHashrate(net.hashrate) : "—" },
              { icon: Gauge, label: "Difficulty", value: net?.difficulty ? `${(net.difficulty / 1e9).toFixed(2)} G` : "—" },
              { icon: Box, label: "Block Reward", value: net?.blockReward ? `${net.blockReward.toFixed(4)} XMR` : "—" },
              { icon: Clock, label: "Block Time", value: net?.blockTime ? `${net.blockTime}s` : "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="stat-card text-center">
                <div className="inline-flex p-2 rounded-lg bg-primary/10 mb-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-2xl font-bold font-mono">{isLoading ? "..." : value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="stat-card">
            <h2 className="font-display font-bold text-lg mb-4">Market Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Price", value: market?.price ? `$${market.price.toFixed(2)}` : "—" },
                { label: "24h Change", value: market?.priceChange24h ? `${market.priceChange24h.toFixed(2)}%` : "—" },
                { label: "Market Cap", value: market?.marketCap ? `$${(market.marketCap / 1e9).toFixed(2)}B` : "—" },
                { label: "24h Volume", value: market?.volume24h ? `$${(market.volume24h / 1e6).toFixed(1)}M` : "—" },
                { label: "24h High", value: market?.high24h ? `$${market.high24h.toFixed(2)}` : "—" },
                { label: "24h Low", value: market?.low24h ? `$${market.low24h.toFixed(2)}` : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-lg bg-primary/5 border border-border/50">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-lg font-bold font-mono">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NetworkExplorerPage;
