import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cpu, Pickaxe, Users, Shield, ArrowRight, Zap, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const HomePage = () => {
  const { user } = useAuth();

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

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(199_89%_48%/0.08)_0%,_transparent_70%)]" />
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-primary font-mono mb-6 animate-slide-up">
            <Zap className="h-4 w-4" />
            Browser-Based Monero Mining
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Mine <span className="text-primary text-glow">XMR</span> with
            <br />your browser
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Start mining Monero instantly using your CPU. No software downloads, no special hardware.
            Just open your browser and earn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? "/mining" : "/register"}>
              <Button variant="neon" size="lg" className="text-base px-8">
                <Pickaxe className="h-5 w-5 mr-2" />
                Start Mining Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/50 glass">
        <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold font-mono text-primary">1,247</p>
            <p className="text-sm text-muted-foreground mt-1">Active Miners</p>
          </div>
          <div>
            <p className="text-3xl font-bold font-mono text-primary">84.2 KH/s</p>
            <p className="text-sm text-muted-foreground mt-1">Network Hashrate</p>
          </div>
          <div>
            <p className="text-3xl font-bold font-mono text-primary">12.45 XMR</p>
            <p className="text-sm text-muted-foreground mt-1">Total Mined</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
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
