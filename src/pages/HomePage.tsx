import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cpu, Pickaxe, Users, Shield, ArrowRight, Zap, Globe, Activity, DollarSign, Hash } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { InteractiveGlobe } from "@/components/ui/interactive-globe";
import { HomeMiningWidget } from "@/components/HomeMiningWidget";
import { StatCard } from "@/components/StatCard";
import { XmrLiveTicker } from "@/components/XmrLiveTicker";
import { XmrNewsFeed } from "@/components/XmrNewsFeed";
import { useXmrMarketData } from "@/hooks/useXmrMarketData";
import { usePlatformStats, formatHashrate } from "@/hooks/usePlatformStats";

const HomePage = () => {
  const { user } = useAuth();
  const { data, isLoading } = useXmrMarketData();
  const { data: stats } = usePlatformStats();
  const market = data?.market;
  const news = data?.news;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Cpu className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold font-mono text-glow">HARIMINE</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button variant="neon" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
                <Link to="/register"><Button variant="neon" size="sm">Start Mining</Button></Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden min-h-[85vh] flex items-center">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(199_89%_48%/0.08)_0%,_transparent_65%)]" />
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-primary font-mono mb-6 animate-slide-up">
                <Zap className="h-4 w-4" />
                Browser-Based Monero Mining
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                Mine <span className="text-primary text-glow">Monero</span> Directly
                <br />From Your Browser
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mb-10">
                No hardware. No downloads. Start mining XMR using your CPU — just open your browser and earn.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to={user ? "/mining" : "/register"}>
                  <Button variant="neon" size="lg" className="text-base px-8">
                    <Pickaxe className="h-5 w-5 mr-2" />
                    Start Mining
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="neon-outline" size="lg" className="text-base px-8">
                    Login
                  </Button>
                </Link>
                {user && (
                  <Link to="/dashboard">
                    <Button variant="secondary" size="lg" className="text-base px-8">
                      View Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Right — Globe */}
            <div className="flex justify-center lg:justify-end">
              <InteractiveGlobe
                size={500}
                dotColor="hsla(199, 89%, 48%, ALPHA)"
                arcColor="hsla(199, 89%, 48%, 0.5)"
                markerColor="hsla(199, 89%, 60%, 1)"
                autoRotateSpeed={0.003}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="border-y border-border/50 glass">
        <div className="container mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Active Miners", value: "2,843" },
            { label: "Platform Hashrate", value: "6.3 MH/s" },
            { label: "Total XMR Mined", value: "47.82 XMR" },
            { label: "Total Paid", value: "31.22 XMR" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-3xl font-bold font-mono text-primary">{value}</p>
              <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Live XMR Rate & News ─── */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Live XMR Market</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">
            Real-time Monero price, market data, and latest news — updated every minute.
          </p>
          <div className="grid lg:grid-cols-2 gap-6">
            <XmrLiveTicker market={market} isLoading={isLoading} />
            <XmrNewsFeed news={news} isLoading={isLoading} />
          </div>
        </div>
      </section>

      {/* ─── Live Dashboard Preview ─── */}
      <section className="py-16 px-4 border-t border-border/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Platform Activity</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">Live stats from the mining network.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Miners Online" value="2,843" trend="up" />
            <StatCard icon={Activity} label="Avg Hashrate" value="2.2 KH/s" trend="up" />
            <StatCard
              icon={DollarSign}
              label="XMR Price"
              value={market?.price ? `$${market.price.toFixed(2)}` : "—"}
              subtitle={market?.priceChange24h ? `${market.priceChange24h > 0 ? "+" : ""}${market.priceChange24h.toFixed(2)}% 24h` : undefined}
              trend={market?.priceChange24h ? (market.priceChange24h > 0 ? "up" : "down") : "neutral"}
            />
            <StatCard icon={Hash} label="Network Difficulty" value="314.2 G" trend="neutral" />
          </div>
        </div>
      </section>

      {/* ─── Start Mining Widget ─── */}
      <section className="py-16 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-lg">
          <h2 className="text-3xl font-bold text-center mb-3">Start Mining Now</h2>
          <p className="text-muted-foreground text-center mb-8">No setup required — control your miner right here.</p>
          <HomeMiningWidget />
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Mine with Harimine?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Globe, title: "Browser Mining", desc: "Mine directly from your browser using WebAssembly. No downloads or special hardware needed." },
              { icon: Shield, title: "Secure & Transparent", desc: "Track your hashrate, earnings, and withdrawals in real-time from your dashboard." },
              { icon: Users, title: "Referral Rewards", desc: "Earn bonus XMR by referring friends. Get a percentage of their mining earnings." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="stat-card text-center">
                <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            <span className="font-mono">HARIMINE</span>
          </div>
          <p>© 2026 Harimine. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
