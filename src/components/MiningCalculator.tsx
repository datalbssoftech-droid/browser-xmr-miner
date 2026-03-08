import { useState } from "react";
import { Calculator } from "lucide-react";
import { useXmrMarketData } from "@/hooks/useXmrMarketData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface MiningCalculatorProps {
  compact?: boolean;
}

export const MiningCalculator = ({ compact = true }: MiningCalculatorProps) => {
  const [hashrate, setHashrate] = useState(1000);
  const [electricityCost, setElectricityCost] = useState(0.1);
  const [hoursPerDay, setHoursPerDay] = useState(24);
  const { data } = useXmrMarketData();

  const price = data?.market?.price ?? 0;
  const networkDifficulty = data?.network?.difficulty ?? 300_000_000_000;

  // XMR per day = (hashrate × 86400) / (difficulty × 2)
  const xmrPerDay = networkDifficulty > 0
    ? (hashrate * hoursPerDay * 3600) / (networkDifficulty * 2)
    : 0;
  const xmrPerMonth = xmrPerDay * 30;
  const usdPerDay = xmrPerDay * price;
  const usdPerMonth = xmrPerMonth * price;
  // Rough power estimate: 65W per 1000 H/s
  const powerWatts = (hashrate / 1000) * 65;
  const dailyElectricityCost = (powerWatts / 1000) * hoursPerDay * electricityCost;
  const dailyProfit = usdPerDay - dailyElectricityCost;

  return (
    <section className={compact ? "py-8 sm:py-12 px-4 border-t border-border/50" : ""}>
      <div className={compact ? "container mx-auto max-w-4xl" : ""}>
        {compact && (
          <>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-2">
              Mining Calculator
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground text-center mb-8 max-w-lg mx-auto">
              Estimate your earnings based on your hashrate and electricity cost.
            </p>
          </>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="stat-card space-y-4">
            <h3 className="font-display font-bold flex items-center gap-2 mb-2">
              <Calculator className="h-5 w-5 text-primary" />
              Your Setup
            </h3>
            <div>
              <Label className="text-xs text-muted-foreground">CPU Hashrate (H/s)</Label>
              <Input
                type="number"
                value={hashrate}
                onChange={(e) => setHashrate(Number(e.target.value))}
                className="mt-1 font-mono bg-background/50"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Electricity Cost ($/kWh)</Label>
              <Input
                type="number"
                step="0.01"
                value={electricityCost}
                onChange={(e) => setElectricityCost(Number(e.target.value))}
                className="mt-1 font-mono bg-background/50"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Mining Hours / Day</Label>
              <Input
                type="number"
                min={1}
                max={24}
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="mt-1 font-mono bg-background/50"
              />
            </div>
          </div>

          {/* Results */}
          <div className="stat-card space-y-3">
            <h3 className="font-display font-bold mb-2">Estimated Earnings</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-border/50">
                <p className="text-xs text-muted-foreground">Daily XMR</p>
                <p className="text-lg font-bold font-mono text-primary">{xmrPerDay.toFixed(6)}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-border/50">
                <p className="text-xs text-muted-foreground">Monthly XMR</p>
                <p className="text-lg font-bold font-mono text-primary">{xmrPerMonth.toFixed(6)}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-border/50">
                <p className="text-xs text-muted-foreground">Daily USD</p>
                <p className="text-lg font-bold font-mono">${usdPerDay.toFixed(4)}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-border/50">
                <p className="text-xs text-muted-foreground">Monthly USD</p>
                <p className="text-lg font-bold font-mono">${usdPerMonth.toFixed(2)}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Electricity Cost/day</span>
                <span className="font-mono">-${dailyElectricityCost.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span>Net Profit/day</span>
                <span className={`font-mono ${dailyProfit >= 0 ? "text-success" : "text-destructive"}`}>
                  ${dailyProfit.toFixed(4)}
                </span>
              </div>
            </div>
            {compact && (
              <Link to="/tools/calculator">
                <Button variant="outline" size="sm" className="w-full mt-2 font-mono text-xs">
                  Full Calculator →
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
