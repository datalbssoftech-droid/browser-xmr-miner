import { Link } from "react-router-dom";
import { Calculator, ArrowLeftRight, Cpu, Globe, Server, TrendingUp } from "lucide-react";

const tools = [
  { icon: Calculator, title: "Mining Calculator", desc: "Estimate your daily & monthly XMR earnings.", path: "/tools/calculator" },
  { icon: ArrowLeftRight, title: "Hashrate Converter", desc: "Convert between H/s, KH/s, MH/s, GH/s.", path: "/tools/converter" },
  { icon: Cpu, title: "CPU Benchmark", desc: "Test your CPU mining speed and estimated earnings.", path: "/tools/benchmark" },
  { icon: Globe, title: "Network Explorer", desc: "View Monero network blocks, difficulty, and rewards.", path: "/tools/network" },
  { icon: Server, title: "Pool Explorer", desc: "Compare mining pools — fees, payouts, hashrate.", path: "/tools/pools" },
  { icon: TrendingUp, title: "XMR Price Tracker", desc: "Real-time price chart and market data.", path: "/tools/price" },
];

export const ToolsSection = () => (
  <section className="py-8 sm:py-12 px-4 border-t border-border/50">
    <div className="container mx-auto">
      <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-2">
        Mining Tools
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground text-center mb-10 max-w-lg mx-auto">
        Free tools to optimize your mining setup.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto">
        {tools.map(({ icon: Icon, title, desc, path }) => (
          <Link key={path} to={path} className="stat-card group hover:border-primary/30 transition-colors">
            <div className="inline-flex p-2 rounded-lg bg-primary/10 mb-3">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm sm:text-base font-bold font-display mb-1">{title}</h3>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  </section>
);
