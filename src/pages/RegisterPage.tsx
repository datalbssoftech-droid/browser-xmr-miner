import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Cpu } from "lucide-react";
import { toast } from "sonner";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (walletAddress && !walletAddress.startsWith("4")) {
      toast.error("Invalid Monero wallet address. Must start with '4'.");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, walletAddress);
      toast.success("Account created! Check your email to confirm.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(199_89%_48%/0.06)_0%,_transparent_50%)]" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Cpu className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-mono text-glow">SHRIMINE</span>
          </Link>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground text-sm mt-1">Start mining Monero in your browser</p>
        </div>
        <form onSubmit={handleSubmit} className="stat-card space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="miner@example.com" required className="mt-1 bg-secondary border-border" />
          </div>
          <div>
            <Label htmlFor="wallet">XMR Wallet Address</Label>
            <Input id="wallet" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} placeholder="4..." className="mt-1 bg-secondary border-border font-mono text-sm" />
            <p className="text-xs text-muted-foreground mt-1">Optional — can be set later in profile</p>
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} className="mt-1 bg-secondary border-border" />
          </div>
          <Button variant="neon" className="w-full" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
