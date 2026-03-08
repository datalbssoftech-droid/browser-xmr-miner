import { Link } from "react-router-dom";
import { ArrowLeft, Cpu, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useXmrMarketData } from "@/hooks/useXmrMarketData";
import { XmrLiveTicker } from "@/components/XmrLiveTicker";
import { XmrNewsFeed } from "@/components/XmrNewsFeed";

const PriceTrackerPage = () => {
  const { data, isLoading } = useXmrMarketData();
  const market = data?.market;

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Cpu className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold font-display text-glow">SHRIMINE</span>
          </Link>
          <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button></Link>
        </div>
      </header>
      <main className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            XMR Price Tracker
          </h1>
          <p className="text-muted-foreground mb-8">Real-time Monero price data, charts, and market information.</p>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <XmrLiveTicker market={market} isLoading={isLoading} />
            <XmrNewsFeed news={data?.news} isLoading={isLoading} />
          </div>

          {market && (
            <div className="stat-card">
              <h2 className="font-display font-bold text-lg mb-4">Market Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Market Cap", value: `$${(market.marketCap / 1e9).toFixed(2)}B` },
                  { label: "24h Volume", value: `$${(market.volume24h / 1e6).toFixed(1)}M` },
                  { label: "Circulating Supply", value: `${(market.circulatingSupply / 1e6).toFixed(2)}M XMR` },
                  { label: "7d Change", value: `${market.priceChange7d?.toFixed(2)}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-lg bg-primary/5 border border-border/50">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-lg font-bold font-mono">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PriceTrackerPage;
