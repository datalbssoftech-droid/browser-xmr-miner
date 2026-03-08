import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Copy, Users, Coins } from "lucide-react";
import { toast } from "sonner";

const ReferralPage = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    if (!user) return;
    setReferralCode(user.id.slice(0, 8));
    supabase.from("referrals").select("*").eq("referrer_id", user.id).then(({ data }) => {
      setReferrals(data || []);
    });
  }, [user]);

  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
  const totalEarnings = referrals.reduce((sum, r) => sum + r.earnings, 0);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Referrals</h1>
          <p className="text-muted-foreground mt-1">Earn by inviting friends</p>
        </div>

        {/* Referral Link */}
        <div className="stat-card mb-6">
          <h3 className="font-semibold mb-3">Your Referral Link</h3>
          <div className="flex gap-2">
            <div className="flex-1 bg-secondary rounded-lg px-4 py-2.5 font-mono text-sm truncate border border-border">
              {referralLink}
            </div>
            <Button variant="neon-outline" onClick={copyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="stat-card">
            <Users className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold font-mono">{referrals.length}</p>
            <p className="text-sm text-muted-foreground">Total Referrals</p>
          </div>
          <div className="stat-card">
            <Coins className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold font-mono">{totalEarnings.toFixed(6)} XMR</p>
            <p className="text-sm text-muted-foreground">Referral Earnings</p>
          </div>
        </div>

        {/* Referral List */}
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Referred Users</h3>
          {referrals.length === 0 ? (
            <p className="text-muted-foreground text-sm">No referrals yet. Share your link to start earning!</p>
          ) : (
            <div className="space-y-3">
              {referrals.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <p className="text-sm font-mono text-muted-foreground">{r.referred_id.slice(0, 8)}...</p>
                  <p className="text-sm font-mono text-primary">{r.earnings.toFixed(6)} XMR</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ReferralPage;
