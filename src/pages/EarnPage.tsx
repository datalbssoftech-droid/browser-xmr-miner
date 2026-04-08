import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Gift, Coins, ArrowRight, Wallet, Clock, CheckCircle, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const POINTS_PER_DOLLAR = 1000; // 1000 points = $1

const EarnPage = () => {
  const { user, profile } = useAuth();
  const [balance, setBalance] = useState({ total_points: 0, redeemed_points: 0 });
  const [completions, setCompletions] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [redeemPoints, setRedeemPoints] = useState("");
  const [loading, setLoading] = useState(false);
  const [offerwallUrl, setOfferwallUrl] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchData();
    fetchOfferwallConfig();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    const [b, c, r] = await Promise.all([
      supabase.from("points_balance").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("offer_completions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("points_redemptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    if (b.data) setBalance(b.data);
    setCompletions(c.data || []);
    setRedemptions(r.data || []);
  };

  const fetchOfferwallConfig = async () => {
    const { data } = await supabase
      .from("platform_config")
      .select("value")
      .eq("key", "cpagrip_offerwall_url")
      .maybeSingle();
    if (data) setOfferwallUrl(data.value);
  };

  const availablePoints = balance.total_points - balance.redeemed_points;
  const availableDollars = availablePoints / POINTS_PER_DOLLAR;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile?.wallet_address) {
      toast.error("Please set your wallet address in your profile first.");
      return;
    }
    const pts = parseInt(redeemPoints);
    if (isNaN(pts) || pts < 1000) {
      toast.error("Minimum redemption is 1000 points ($1.00)");
      return;
    }
    if (pts > availablePoints) {
      toast.error("Not enough points");
      return;
    }
    setLoading(true);
    const amount = pts / POINTS_PER_DOLLAR;
    const { error } = await supabase.from("points_redemptions").insert({
      user_id: user.id,
      points: pts,
      amount,
      wallet_address: profile.wallet_address,
    });
    if (error) {
      toast.error("Failed to submit redemption");
    } else {
      toast.success("Redemption request submitted!");
      setRedeemPoints("");
      fetchData();
    }
    setLoading(false);
  };

  // Build offerwall URL with user's ID as subid
  const fullOfferwallUrl = offerwallUrl
    ? `${offerwallUrl}${offerwallUrl.includes("?") ? "&" : "?"}subid=${user?.id || ""}`
    : "";

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Gift className="h-7 w-7 text-primary" />
            Earn Points
          </h1>
          <p className="text-muted-foreground mt-1">Complete offers to earn reward points</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="stat-card text-center">
            <Coins className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold font-mono">{availablePoints.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Available Points</p>
          </div>
          <div className="stat-card text-center">
            <Wallet className="h-6 w-6 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold font-mono">${availableDollars.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Cash Value</p>
          </div>
          <div className="stat-card text-center">
            <CheckCircle className="h-6 w-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold font-mono">{completions.length}</p>
            <p className="text-xs text-muted-foreground">Offers Completed</p>
          </div>
        </div>

        <Tabs defaultValue="offers">
          <TabsList className="bg-secondary border border-border mb-6">
            <TabsTrigger value="offers">Offerwall</TabsTrigger>
            <TabsTrigger value="redeem">Redeem Points</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Offerwall */}
          <TabsContent value="offers">
            <div className="stat-card">
              {fullOfferwallUrl ? (
                <iframe
                  src={fullOfferwallUrl}
                  className="w-full rounded-lg border border-border"
                  style={{ minHeight: "600px" }}
                  title="CPAGrip Offerwall"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
                />
              ) : (
                <div className="text-center py-16">
                  <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Offerwall is not configured yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Contact admin to set up the offerwall.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Redeem */}
          <TabsContent value="redeem">
            <div className="stat-card max-w-lg">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                Redeem Points
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                1000 points = $1.00 · Minimum redemption: 1000 points
              </p>
              <form onSubmit={handleRedeem} className="space-y-4">
                <div>
                  <Label>Points to Redeem</Label>
                  <Input
                    type="number"
                    min={1000}
                    step={100}
                    value={redeemPoints}
                    onChange={(e) => setRedeemPoints(e.target.value)}
                    placeholder="1000"
                    className="mt-1 bg-secondary border-border font-mono"
                    required
                  />
                  {redeemPoints && !isNaN(parseInt(redeemPoints)) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      = ${(parseInt(redeemPoints) / POINTS_PER_DOLLAR).toFixed(2)} USD
                    </p>
                  )}
                </div>
                <div>
                  <Label>Wallet Address</Label>
                  <Input
                    value={profile?.wallet_address || "Not set"}
                    disabled
                    className="mt-1 bg-secondary border-border font-mono text-sm"
                  />
                </div>
                <Button variant="neon" type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Redemption"}
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* History */}
          <TabsContent value="history">
            <div className="space-y-6">
              {/* Offer completions */}
              <div className="stat-card">
                <h3 className="font-semibold mb-4">Completed Offers</h3>
                {completions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No completed offers yet. Start completing offers to earn points!</p>
                ) : (
                  <div className="space-y-3">
                    {completions.map((c) => (
                      <div key={c.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                        <div>
                          <p className="text-sm font-medium">{c.offer_name || "Offer"}</p>
                          <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className="text-sm font-mono text-success">+{c.points_earned} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Redemptions */}
              <div className="stat-card">
                <h3 className="font-semibold mb-4">Redemption Requests</h3>
                {redemptions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No redemptions yet.</p>
                ) : (
                  <div className="space-y-3">
                    {redemptions.map((r) => (
                      <div key={r.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                        <div>
                          <p className="font-mono text-sm">{r.points} pts → ${r.amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          r.status === "approved" ? "bg-success/20 text-success" :
                          r.status === "rejected" ? "bg-destructive/20 text-destructive" :
                          "bg-warning/20 text-warning"
                        }`}>
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default EarnPage;
