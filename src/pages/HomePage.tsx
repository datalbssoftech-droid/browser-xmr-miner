import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cpu, Pickaxe, Users, Shield, ArrowRight, Zap, Globe, Activity, DollarSign, Hash, Wrench, Calculator, ArrowLeftRight, Server, TrendingUp, Monitor, Mail, BookOpen, Calendar, Menu, X, Home, HelpCircle, Info, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { InteractiveGlobe } from "@/components/ui/interactive-globe";
import { HomeMiningWidget } from "@/components/HomeMiningWidget";
import { StatCard } from "@/components/StatCard";
import { XmrLiveTicker } from "@/components/XmrLiveTicker";
import { XmrNewsFeed } from "@/components/XmrNewsFeed";
import { HowItWorks } from "@/components/HowItWorks";
import { MiningCalculator } from "@/components/MiningCalculator";
import { MiningPools } from "@/components/MiningPools";
import { NetworkStats } from "@/components/NetworkStats";
import { EducationSection } from "@/components/EducationSection";
import { SecuritySection } from "@/components/SecuritySection";
import { ToolsSection } from "@/components/ToolsSection";
import { AnimatedSection } from "@/components/AnimatedSection";
import { useXmrMarketData } from "@/hooks/useXmrMarketData";
import { usePlatformStats, formatHashrate } from "@/hooks/usePlatformStats";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const toolsMenu = [
  { icon: Calculator, label: "Calculator", path: "/tools/calculator" },
  { icon: ArrowLeftRight, label: "Converter", path: "/tools/converter" },
  { icon: Cpu, label: "Benchmark", path: "/tools/benchmark" },
  { icon: Globe, label: "Network", path: "/tools/network" },
  { icon: Server, label: "Pools", path: "/tools/pools" },
  { icon: TrendingUp, label: "Price", path: "/tools/price" },
];

const navLinks = [
  { label: "Home", path: "/", icon: Home },
  { label: "About", path: "/about", icon: Info },
  { label: "FAQ", path: "/faq", icon: HelpCircle },
  { label: "Contact", path: "/contact", icon: Mail },
];

const bottomNavLinks = [
  { label: "Home", path: "/", icon: Home },
  { label: "Tools", path: "/tools/calculator", icon: Wrench },
  { label: "Mine", path: "/register", icon: Pickaxe },
  { label: "FAQ", path: "/faq", icon: HelpCircle },
];

const HomePage = () => {
  const { user } = useAuth();
  const { data, isLoading } = useXmrMarketData();
  const { data: stats } = usePlatformStats();
  const market = data?.market;
  const news = data?.news;
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    supabase.from("blog_posts").select("*").eq("is_published", true).order("published_at", { ascending: false }).limit(3).then(({ data }) => {
      setBlogPosts(data || []);
    });
  }, []);

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribing(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: newsletterEmail });
    if (error) {
      if (error.code === "23505") {
        toast.info("You're already subscribed!");
      } else {
        toast.error("Subscription failed. Try again.");
      }
    } else {
      toast.success("Successfully subscribed!");
      setNewsletterEmail("");
    }
    setSubscribing(false);
  };

  return (
    <div className="min-h-screen pb-16 sm:pb-0">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Cpu className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <span className="text-lg sm:text-xl font-bold font-display text-glow">SHRIMINE</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map(({ label, path }) => (
              <Link key={path} to={path} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Tools dropdown */}
            <div className="relative hidden sm:block">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setToolsOpen(!toolsOpen)}
                className="font-mono text-xs gap-1"
              >
                <Wrench className="h-4 w-4" />
                <span className="hidden sm:inline">Tools</span>
              </Button>
              {toolsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setToolsOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 glass border border-border/50 rounded-lg shadow-xl z-50 py-1">
                    {toolsMenu.map(({ icon: Icon, label, path }) => (
                      <Link
                        key={path}
                        to={path}
                        onClick={() => setToolsOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-primary/10 transition-colors"
                      >
                        <Icon className="h-4 w-4 text-primary" />
                        {label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden sm:flex items-center gap-2">
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

            {/* Mobile Burger Menu */}
            <Button
              variant="ghost"
              size="sm"
              className="sm:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden glass border-t border-border/50 py-4 px-4">
            <nav className="space-y-2 mb-4">
              {navLinks.map(({ label, path, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {label}
                </Link>
              ))}
              <div className="border-t border-border/50 pt-2 mt-2">
                <p className="px-3 text-xs text-muted-foreground mb-2">Tools</p>
                {toolsMenu.map(({ icon: Icon, label, path }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                  </Link>
                ))}
              </div>
            </nav>
            <div className="flex gap-2">
              {user ? (
                <Link to="/dashboard" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="neon" className="w-full">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">Login</Button>
                  </Link>
                  <Link to="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="neon" className="w-full">Start Mining</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ─── Hero ─── */}
      <section className="relative pt-16 sm:pt-24 pb-6 sm:pb-10 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(199_89%_48%/0.08)_0%,_transparent_65%)]" />
        <div className="container mx-auto relative z-10">
          <div className="relative lg:grid lg:grid-cols-2 lg:gap-6 lg:items-center">
            <div className="flex justify-center lg:justify-end lg:order-2 mx-auto lg:mx-0">
              <div className="w-[160px] h-[160px] sm:w-[220px] sm:h-[220px] lg:w-[380px] lg:h-[380px] opacity-70 lg:opacity-100">
                <InteractiveGlobe
                  size={380}
                  dotColor="hsla(199, 89%, 48%, ALPHA)"
                  arcColor="hsla(199, 89%, 48%, 0.5)"
                  markerColor="hsla(199, 89%, 60%, 1)"
                  autoRotateSpeed={0.003}
                  className="w-full h-full"
                />
              </div>
            </div>
            <div className="text-center lg:text-left lg:order-1 -mt-8 sm:-mt-2 lg:mt-0 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs sm:text-sm text-primary font-mono mb-3 sm:mb-4 animate-slide-up">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                Browser-Based XMR Mining
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black mb-3 sm:mb-4 leading-tight tracking-tight">
                <span className="animate-typing">Mine</span>{" "}
                <span className="text-glow-strong">Monero</span>
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                in Your Browser
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-4 sm:mb-6">
                No hardware. No downloads. Start mining XMR using your CPU — just open your browser and earn.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center lg:justify-start">
                <Link to={user ? "/mining" : "/register"}>
                  <Button variant="neon" size="default" className="text-sm px-5 w-full sm:w-auto font-display">
                    <Pickaxe className="h-4 w-4 mr-2" />
                    Start Mining
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="neon-outline" size="default" className="text-sm px-5 w-full sm:w-auto font-display">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <AnimatedSection>
        <section className="border-y border-border/50 glass">
          <div className="container mx-auto px-4 py-4 sm:py-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-center">
            {[
              { label: "Active Miners", value: stats ? stats.activeMiners.toLocaleString() : "—" },
              { label: "Platform Hashrate", value: stats ? formatHashrate(stats.platformHashrate) : "—" },
              { label: "Total XMR Mined", value: stats ? `${stats.totalMined.toFixed(4)} XMR` : "—" },
              { label: "Total Paid", value: stats ? `${stats.totalPaid.toFixed(4)} XMR` : "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold font-mono text-primary">{value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* ─── Start Mining Widget ─── */}
      <AnimatedSection>
        <section className="py-8 sm:py-12 px-4">
          <div className="container mx-auto max-w-lg">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-2">Start Mining Now</h2>
            <p className="text-sm text-muted-foreground text-center mb-4 sm:mb-6">No setup required — control your miner right here.</p>
            <HomeMiningWidget />
          </div>
        </section>
      </AnimatedSection>

      {/* ─── How It Works ─── */}
      <AnimatedSection><HowItWorks /></AnimatedSection>

      {/* ─── Mining Calculator ─── */}
      <AnimatedSection><MiningCalculator /></AnimatedSection>

      {/* ─── Mining Pools ─── */}
      <AnimatedSection><MiningPools /></AnimatedSection>

      {/* ─── Live XMR Market ─── */}
      <AnimatedSection>
        <section className="py-8 sm:py-12 px-4 border-t border-border/50">
          <div className="container mx-auto">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-2">Live XMR Market</h2>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-lg mx-auto">
              Real-time Monero price, market data, and latest news.
            </p>
            <div className="grid lg:grid-cols-2 gap-4">
              <XmrLiveTicker market={market} isLoading={isLoading} />
              <XmrNewsFeed news={news} isLoading={isLoading} />
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ─── Network Stats ─── */}
      <AnimatedSection><NetworkStats /></AnimatedSection>

      {/* ─── Platform Activity ─── */}
      <AnimatedSection>
        <section className="py-8 sm:py-12 px-4 border-t border-border/50">
          <div className="container mx-auto">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-2">Platform Activity</h2>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-lg mx-auto">Live stats from the mining network.</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard icon={Users} label="Miners Online" value={stats ? stats.activeMiners.toLocaleString() : "—"} trend="up" />
              <StatCard icon={Activity} label="Avg Hashrate" value={stats ? formatHashrate(stats.platformHashrate) : "—"} trend="up" />
              <StatCard
                icon={DollarSign}
                label="XMR Price"
                value={market?.price ? `$${market.price.toFixed(2)}` : "—"}
                subtitle={market?.priceChange24h ? `${market.priceChange24h > 0 ? "+" : ""}${market.priceChange24h.toFixed(2)}% 24h` : undefined}
                trend={market?.priceChange24h ? (market.priceChange24h > 0 ? "up" : "down") : "neutral"}
              />
              <StatCard icon={Hash} label="Network Difficulty" value={data?.network?.difficulty ? `${(data.network.difficulty / 1e9).toFixed(1)} G` : "—"} trend="neutral" />
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ─── Tools ─── */}
      <AnimatedSection><ToolsSection /></AnimatedSection>

      {/* ─── Education ─── */}
      <AnimatedSection><EducationSection /></AnimatedSection>

      {/* ─── Security ─── */}
      <AnimatedSection><SecuritySection /></AnimatedSection>

      {/* ─── Features ─── */}
      <AnimatedSection>
        <section className="py-8 sm:py-12 px-4 border-t border-border/50">
          <div className="container mx-auto">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-6 sm:mb-8">Why Shrimine?</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
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
      </AnimatedSection>

      {/* ─── Blog ─── */}
      <AnimatedSection>
        <section className="py-8 sm:py-12 px-4 border-t border-border/50">
          <div className="container mx-auto">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-2">Latest from the Blog</h2>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-lg mx-auto">
              News, guides, and updates from the Shrimine team.
            </p>
            {blogPosts.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm">No blog posts yet. Check back soon!</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {blogPosts.map((post) => (
                  <div key={post.id} className="stat-card group hover:border-primary/50 transition-colors">
                    {post.cover_image && (
                      <img src={post.cover_image} alt={post.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="h-3 w-3" />
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : "—"}
                    </div>
                    <h3 className="font-bold font-display text-base mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt || post.content.slice(0, 100)}...</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </AnimatedSection>

      {/* ─── Newsletter ─── */}
      <AnimatedSection>
        <section className="py-8 sm:py-12 px-4 border-t border-border/50">
          <div className="container mx-auto max-w-xl text-center">
            <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4">
              <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">Stay Updated</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Subscribe to our newsletter for mining tips, platform updates, and XMR news.
            </p>
            <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="flex-1 bg-secondary border-border"
              />
              <Button variant="neon" type="submit" disabled={subscribing}>
                {subscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </section>
      </AnimatedSection>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 sm:py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <Cpu className="h-6 w-6 text-primary" />
                <span className="font-display font-bold text-lg">SHRIMINE</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Browser-based Monero mining for everyone. No hardware required.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <nav className="space-y-2">
                <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
                <Link to="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
                <Link to="/faq" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
                <Link to="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              </nav>
            </div>

            {/* Tools */}
            <div>
              <h4 className="font-bold mb-4">Tools</h4>
              <nav className="space-y-2">
                <Link to="/tools/calculator" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Calculator</Link>
                <Link to="/tools/converter" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Converter</Link>
                <Link to="/tools/benchmark" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Benchmark</Link>
                <Link to="/tools/network" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Network</Link>
              </nav>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <nav className="space-y-2">
                <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
              </nav>
            </div>
          </div>

          <div className="border-t border-border/50 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-muted-foreground">
            <p>© 2026 Shrimine. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden glass border-t border-border/50">
        <div className="flex items-center justify-around h-14">
          {bottomNavLinks.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-primary transition-colors"
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="text-xs">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default HomePage;
