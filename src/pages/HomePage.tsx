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
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Cpu className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <span className="text-lg sm:text-xl font-bold font-display text-glow">HARIMINE</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
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
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 overflow-hidden min-h-[70vh] sm:min-h-[85vh] flex items-center">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(199_89%_48%/0.08)_0%,_transparent_65%)]" />
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs sm:text-sm text-primary font-mono mb-4 sm:mb-6 animate-slide-up">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                Browser-Based XMR Mining
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black mb-4 sm:mb-6 leading-tight tracking-tight">
                <span className="animate-typing">Mine</span>{" "}
                <span className="text-glow-strong">Monero</span>
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                in Your Browser
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-10">
                No hardware. No downloads. Start mining XMR using your CPU — just open your browser and earn.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link to={user ? "/mining" : "/register"}>
                  <Button variant="neon" size="lg" className="text-sm sm:text-base px-6 sm:px-8 w-full sm:w-auto font-display">
                    <Pickaxe className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Start Mining
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="neon-outline" size="lg" className="text-sm sm:text-base px-6 sm:px-8 w-full sm:w-auto font-display">
                    Login
                  </Button>
                </Link>
                {user && (
                  <Link to="/dashboard">
                    <Button variant="secondary" size="lg" className="text-sm sm:text-base px-6 sm:px-8 w-full sm:w-auto font-display">
                      Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Right — Globe */}
            <div className="flex justify-center lg:justify-end order-1 lg:order-2">
              <div className="w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px]">
                <InteractiveGlobe
                  size={500}
                  dotColor="hsla(199, 89%, 48%, ALPHA)"
                  arcColor="hsla(199, 89%, 48%, 0.5)"
                  markerColor="hsla(199, 89%, 60%, 1)"
                  autoRotateSpeed={0.003}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="border-y border-border/50 glass">
        <div className="container mx-auto px-4 py-6 sm:py-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
          {[
            { label: "Active Miners", value: stats ? stats.activeMiners.toLocaleString() : "—" },
            { label: "Platform Hashrate", value: stats ? formatHashrate(stats.platformHashrate) : "—" },
            { label: "Total XMR Mined", value: stats ? `${stats.totalMined.toFixed(4)} XMR` : "—" },
            { label: "Total Paid", value: stats ? `${stats.totalPaid.toFixed(4)} XMR` : "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-primary">{value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Live XMR Rate & News ─── */}
      <section className="py-12 sm:py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-2 sm:mb-3">Live XMR Market</h2>
          <p className="text-sm sm:text-base text-muted-foreground text-center mb-8 sm:mb-10 max-w-lg mx-auto">
            Real-time Monero price, market data, and latest news.
          </p>
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            <XmrLiveTicker market={market} isLoading={isLoading} />
            <XmrNewsFeed news={news} isLoading={isLoading} />
          </div>
        </div>
      </section>

      {/* ─── Live Dashboard Preview ─── */}
      <section className="py-12 sm:py-16 px-4 border-t border-border/50">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-2 sm:mb-3">Platform Activity</h2>
          <p className="text-sm sm:text-base text-muted-foreground text-center mb-8 sm:mb-10 max-w-lg mx-auto">Live stats from the mining network.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard icon={Users} label="Miners Online" value={stats ? stats.activeMiners.toLocaleString() : "—"} trend="up" />
            <StatCard icon={Activity} label="Avg Hashrate" value={stats ? formatHashrate(stats.platformHashrate) : "—"} trend="up" />
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
      <section className="py-12 sm:py-16 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-lg">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-2 sm:mb-3">Start Mining Now</h2>
          <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 sm:mb-8">No setup required — control your miner right here.</p>
          <HomeMiningWidget />
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-12 sm:py-20 px-4 border-t border-border/50">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-8 sm:mb-12">Why Harimine?</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Globe, title: "Browser Mining", desc: "Mine directly from your browser using WebAssembly. No downloads or special hardware." },
              { icon: Shield, title: "Secure & Transparent", desc: "Track your hashrate, earnings, and withdrawals in real-time." },
              { icon: Users, title: "Referral Rewards", desc: "Earn bonus XMR by referring friends. Get a percentage of their earnings." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="stat-card text-center">
                <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4">
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-bold font-display mb-2">{title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 sm:py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between text-xs sm:text-sm text-muted-foreground gap-2">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            <span className="font-display">HARIMINE</span>
          </div>
          <p>© 2026 Harimine. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
