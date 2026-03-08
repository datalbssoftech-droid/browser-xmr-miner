import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Cpu, LayoutDashboard, Pickaxe, User, Users, Wallet, Shield, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/mining", label: "Mining", icon: Pickaxe },
  { to: "/withdrawals", label: "Withdrawals", icon: Wallet },
  { to: "/referrals", label: "Referrals", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
];

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut, isAdmin, profile } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 glass border-r border-border/50 p-4">
        <Link to="/" className="flex items-center gap-2 mb-8 px-2">
          <Cpu className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-glow font-mono">HARIMINE</span>
        </Link>
        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === to
                  ? "bg-primary/10 text-primary glow-neon"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname.startsWith("/admin")
                  ? "bg-primary/10 text-primary glow-neon"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>
        <div className="border-t border-border/50 pt-4 mt-4">
          <div className="px-3 mb-3">
            <p className="text-xs text-muted-foreground truncate font-mono">
              {profile?.wallet_address ? `${profile.wallet_address.slice(0, 8)}...${profile.wallet_address.slice(-6)}` : "No wallet"}
            </p>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Cpu className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-glow font-mono">HARIMINE</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur pt-16">
          <nav className="p-4 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-all ${
                  location.pathname === to ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-muted-foreground">
                <Shield className="h-5 w-5" />
                Admin
              </Link>
            )}
            <Button variant="ghost" className="w-full justify-start text-muted-foreground mt-4" onClick={signOut}>
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:p-8 p-4 pt-20 lg:pt-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};
