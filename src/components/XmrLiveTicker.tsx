import { TrendingUp, TrendingDown, DollarSign, BarChart3, ArrowUpDown, Coins } from "lucide-react";
import type { XmrMarketData } from "@/hooks/useXmrMarketData";

interface XmrLiveTickerProps {
  market: XmrMarketData | null | undefined;
  isLoading: boolean;
}

const fmt = (n: number, decimals = 2) =>
  n >= 1e9
    ? `$${(n / 1e9).toFixed(decimals)}B`
    : n >= 1e6
      ? `$${(n / 1e6).toFixed(decimals)}M`
      : `$${n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

export const XmrLiveTicker = ({ market, isLoading }: XmrLiveTickerProps) => {
  if (isLoading || !market) {
    return (
      <div className="stat-card animate-pulse">
        <div className="h-32 bg-muted rounded" />
      </div>
    );
  }

  const isUp = market.priceChange24h >= 0;

  return (
    <div className="stat-card">
      {/* Price header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-muted-foreground font-mono mb-1">XMR / USD</p>
          <p className="text-4xl font-black font-mono">
            ${market.price.toFixed(2)}
          </p>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-mono font-bold ${
          isUp ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
        }`}>
          {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {isUp ? "+" : ""}{market.priceChange24h.toFixed(2)}%
        </div>
      </div>

      {/* Sparkline */}
      {market.sparkline7d.length > 0 && (
        <div className="mb-6 h-16">
          <svg viewBox={`0 0 ${market.sparkline7d.length} 100`} className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={`hsl(var(--${isUp ? "success" : "destructive"}))`} stopOpacity="0.3" />
                <stop offset="100%" stopColor={`hsl(var(--${isUp ? "success" : "destructive"}))`} stopOpacity="0" />
              </linearGradient>
            </defs>
            {(() => {
              const min = Math.min(...market.sparkline7d);
              const max = Math.max(...market.sparkline7d);
              const range = max - min || 1;
              const points = market.sparkline7d.map((v, i) => `${i},${100 - ((v - min) / range) * 90}`).join(" ");
              const areaPoints = `0,100 ${points} ${market.sparkline7d.length - 1},100`;
              return (
                <>
                  <polygon points={areaPoints} fill="url(#sparkGrad)" />
                  <polyline
                    points={points}
                    fill="none"
                    stroke={`hsl(var(--${isUp ? "success" : "destructive"}))`}
                    strokeWidth="1.5"
                  />
                </>
              );
            })()}
          </svg>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">24h Range</p>
            <p className="text-sm font-mono">${market.low24h.toFixed(2)} – ${market.high24h.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">24h Volume</p>
            <p className="text-sm font-mono">{fmt(market.volume24h)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Market Cap</p>
            <p className="text-sm font-mono">{fmt(market.marketCap)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">7d Change</p>
            <p className={`text-sm font-mono font-bold ${market.priceChange7d >= 0 ? "text-success" : "text-destructive"}`}>
              {market.priceChange7d >= 0 ? "+" : ""}{market.priceChange7d.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
