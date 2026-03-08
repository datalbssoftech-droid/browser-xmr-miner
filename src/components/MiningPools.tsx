import { Server, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const pools = [
  {
    name: "SupportXMR",
    url: "https://supportxmr.com",
    fee: "0.6%",
    minPayout: "0.1 XMR",
    miners: "5,000+",
    hashrate: "~50 MH/s",
  },
  {
    name: "MoneroOcean",
    url: "https://moneroocean.stream",
    fee: "0%",
    minPayout: "0.003 XMR",
    miners: "20,000+",
    hashrate: "~120 MH/s",
  },
  {
    name: "2Miners",
    url: "https://2miners.com/xmr-mining-pool",
    fee: "1%",
    minPayout: "0.01 XMR",
    miners: "3,000+",
    hashrate: "~25 MH/s",
  },
];

export const MiningPools = () => (
  <section className="py-8 sm:py-12 px-4 border-t border-border/50">
    <div className="container mx-auto">
      <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-2">
        Supported Mining Pools
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground text-center mb-10 max-w-lg mx-auto">
        We connect to trusted, well-established Monero mining pools.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
        {pools.map((pool) => (
          <div key={pool.name} className="stat-card group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg">{pool.name}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pool Hashrate</span>
                <span className="font-mono">{pool.hashrate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pool Fee</span>
                <span className="font-mono">{pool.fee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min Payout</span>
                <span className="font-mono">{pool.minPayout}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Miners</span>
                <span className="font-mono">{pool.miners}</span>
              </div>
            </div>
            <a href={pool.url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full mt-4 font-mono text-xs">
                Visit Pool <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </a>
          </div>
        ))}
      </div>
    </div>
  </section>
);
