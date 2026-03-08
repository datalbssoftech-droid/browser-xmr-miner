import { Activity, Gauge, Box, Clock } from "lucide-react";
import { useXmrMarketData } from "@/hooks/useXmrMarketData";

const formatHashrate = (h: number) => {
  if (h >= 1e9) return `${(h / 1e9).toFixed(2)} GH/s`;
  if (h >= 1e6) return `${(h / 1e6).toFixed(2)} MH/s`;
  if (h >= 1e3) return `${(h / 1e3).toFixed(2)} KH/s`;
  return `${h.toFixed(0)} H/s`;
};

export const NetworkStats = () => {
  const { data, isLoading } = useXmrMarketData();
  const net = data?.network;

  const stats = [
    {
      icon: Activity,
      label: "Network Hashrate",
      value: net?.hashrate ? formatHashrate(net.hashrate) : "—",
    },
    {
      icon: Gauge,
      label: "Network Difficulty",
      value: net?.difficulty ? `${(net.difficulty / 1e9).toFixed(2)} G` : "—",
    },
    {
      icon: Box,
      label: "Block Reward",
      value: net?.blockReward ? `${net.blockReward.toFixed(4)} XMR` : "—",
    },
    {
      icon: Clock,
      label: "Block Time",
      value: net?.blockTime ? `${net.blockTime}s` : "—",
    },
  ];

  return (
    <section className="py-8 sm:py-12 px-4 border-t border-border/50">
      <div className="container mx-auto">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-2">
          Monero Network
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground text-center mb-10 max-w-lg mx-auto">
          Live data from the Monero blockchain.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="stat-card text-center">
              <div className="inline-flex p-2 rounded-lg bg-primary/10 mb-3">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xl sm:text-2xl font-bold font-mono">{isLoading ? "..." : value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
