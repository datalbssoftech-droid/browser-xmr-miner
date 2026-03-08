import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

const WithdrawalPage = () => {
  const { user, profile } = useAuth();
  const [amount, setAmount] = useState("");
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [minWithdrawal, setMinWithdrawal] = useState(0.01);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [w, c] = await Promise.all([
        supabase.from("withdrawals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("platform_config").select("value").eq("key", "min_withdrawal").single(),
      ]);
      setWithdrawals(w.data || []);
      if (c.data) setMinWithdrawal(parseFloat(c.data.value));
    };
    fetch();
  }, [user]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile?.wallet_address) {
      toast.error("Please set your wallet address in your profile first.");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < minWithdrawal) {
      toast.error(`Minimum withdrawal is ${minWithdrawal} XMR`);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("withdrawals").insert({
      user_id: user.id,
      amount: amt,
      wallet_address: profile.wallet_address,
    });
    if (error) {
      toast.error("Failed to submit withdrawal");
    } else {
      toast.success("Withdrawal request submitted!");
      setAmount("");
      const { data } = await supabase.from("withdrawals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setWithdrawals(data || []);
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Withdrawals</h1>
          <p className="text-muted-foreground mt-1">Request XMR payouts</p>
        </div>

        <form onSubmit={handleWithdraw} className="stat-card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Request Withdrawal</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Amount (XMR)</Label>
              <Input
                type="number"
                step="0.000001"
                min={minWithdrawal}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min ${minWithdrawal}`}
                className="mt-1 bg-secondary border-border font-mono"
                required
              />
            </div>
            <div>
              <Label>Wallet</Label>
              <Input
                value={profile?.wallet_address || "Not set"}
                disabled
                className="mt-1 bg-secondary border-border font-mono text-sm"
              />
            </div>
          </div>
          <Button variant="neon" className="mt-4" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Withdrawal"}
          </Button>
        </form>

        {/* History */}
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Withdrawal History</h3>
          {withdrawals.length === 0 ? (
            <p className="text-muted-foreground text-sm">No withdrawals yet.</p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div key={w.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <div>
                    <p className="font-mono text-sm">{w.amount.toFixed(6)} XMR</p>
                    <p className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    w.status === "approved" ? "bg-success/20 text-success" :
                    w.status === "rejected" ? "bg-destructive/20 text-destructive" :
                    "bg-warning/20 text-warning"
                  }`}>
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default WithdrawalPage;
