import { Link } from "react-router-dom";
import { ArrowLeft, Cpu, Server, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const pools = [
  {
    name: "SupportXMR",
    url: "https://supportxmr.com",
    fee: "0.6%",
    minPayout: "0.1 XMR",
    miners: "5,000+",
    hashrate: "~50 MH/s",
    payoutFrequency: "Every 2 hours",
    location: "Global",
  },
  {
    name: "MoneroOcean",
    url: "https://moneroocean.stream",
    fee: "0%",
    minPayout: "0.003 XMR",
    miners: "20,000+",
    hashrate: "~120 MH/s",
    payoutFrequency: "Every 2 hours",
    location: "Global",
  },
  {
    name: "2Miners",
    url: "https://2miners.com/xmr-mining-pool",
    fee: "1%",
    minPayout: "0.01 XMR",
    miners: "3,000+",
    hashrate: "~25 MH/s",
    payoutFrequency: "Every 2 hours",
    location: "EU, US, Asia",
  },
];

const PoolExplorerPage = () => (
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
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">Mining Pool Explorer</h1>
        <p className="text-muted-foreground mb-8">Compare the top Monero mining pools.</p>

        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {pools.map((pool) => (
            <div key={pool.name} className="stat-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Server className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-display font-bold text-xl">{pool.name}</h2>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  ["Pool Hashrate", pool.hashrate],
                  ["Pool Fee", pool.fee],
                  ["Min Payout", pool.minPayout],
                  ["Active Miners", pool.miners],
                  ["Payout Frequency", pool.payoutFrequency],
                  ["Locations", pool.location],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-mono">{value}</span>
                  </div>
                ))}
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
    </main>
  </div>
);

export default PoolExplorerPage;
