import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Gift, Coins, ArrowRight, Wallet, CheckCircle, ExternalLink, Search, Loader2, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const POINTS_PER_DOLLAR = 1000;

interface CpaOffer {
  campid: string;
  title: string;
  description: string;
  amount: string;
  link: string;
  category: string;
  country: string;
  epc: string;
  conversion: string;
  image?: string;
  type?: string;
}

const EarnPage = () => {
  const { user, profile } = useAuth();
  const [balance, setBalance] = useState({ total_points: 0, redeemed_points: 0 });
  const [completions, setCompletions] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [redeemPoints, setRedeemPoints] = useState("");
  const [loading, setLoading] = useState(false);

  // Offers state
  const [offers, setOffers] = useState<CpaOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedConfig, setFeedConfig] = useState<{ user_id: string; pubkey: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchData();
    fetchFeedConfig();
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

  const fetchFeedConfig = async () => {
    const { data } = await supabase
      .from("platform_config")
      .select("key, value")
      .in("key", ["cpagrip_user_id", "cpagrip_pubkey"]);

    if (data && data.length > 0) {
      const cfg: Record<string, string> = {};
      data.forEach((d: any) => { cfg[d.key] = d.value; });
      if (cfg.cpagrip_user_id && cfg.cpagrip_pubkey) {
        setFeedConfig({ user_id: cfg.cpagrip_user_id, pubkey: cfg.cpagrip_pubkey });
      }
    }
  };

  const fetchOffers = useCallback(async () => {
    if (!feedConfig || !user) return;
    setOffersLoading(true);
    try {
      const feedUrl = `https://www.cpagrip.com/common/offer_feed_json.php?user_id=${feedConfig.user_id}&pubkey=${feedConfig.pubkey}&tracking_id=${user.id}`;
      
      // Use JSONP via script tag to bypass CORS
      const callbackName = `cpagrip_cb_${Date.now()}`;
      const result = await new Promise<any[]>((resolve, reject) => {
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error("Request timed out"));
        }, 10000);

        const cleanup = () => {
          clearTimeout(timeout);
          delete (window as any)[callbackName];
          script.remove();
        };

        (window as any)[callbackName] = (data: any) => {
          cleanup();
          if (data?.offers) {
            resolve(data.offers);
          } else if (Array.isArray(data)) {
            resolve(data);
          } else {
            resolve([]);
          }
        };

        const script = document.createElement("script");
        script.src = `${feedUrl}&callback=${callbackName}`;
        script.onerror = () => {
          cleanup();
          reject(new Error("Failed to load offers"));
        };
        document.head.appendChild(script);
      });

      setOffers(result);
    } catch (err) {
      console.error("Failed to fetch offers:", err);
      toast.error("Failed to load offers. Please try again.");
    }
    setOffersLoading(false);
  }, [feedConfig, user]);

  useEffect(() => {
    if (feedConfig && user) {
      fetchOffers();
    }
  }, [feedConfig, user, fetchOffers]);

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

  const filteredOffers = offers.filter((o) =>
    !searchQuery || o.title?.toLowerCase().includes(searchQuery.toLowerCase()) || o.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPointsForOffer = (amount: string) => {
    const payout = parseFloat(amount) || 0;
    return Math.round(payout * POINTS_PER_DOLLAR);
  };

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
            <TabsTrigger value="offers">Available Offers</TabsTrigger>
            <TabsTrigger value="redeem">Redeem Points</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Offers */}
          <TabsContent value="offers">
            {!feedConfig ? (
              <div className="stat-card text-center py-16">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Offerwall is not configured yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Contact admin to set up the offer feed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search & Refresh */}
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search offers..."
                      className="pl-10 bg-secondary border-border"
                    />
                  </div>
                  <Button variant="neon-outline" size="sm" onClick={fetchOffers} disabled={offersLoading}>
                    {offersLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                  </Button>
                </div>

                {/* Offers Grid */}
                {offersLoading && offers.length === 0 ? (
                  <div className="text-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading offers...</p>
                  </div>
                ) : filteredOffers.length === 0 ? (
                  <div className="stat-card text-center py-12">
                    <p className="text-muted-foreground">No offers available right now. Check back later!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOffers.map((offer) => {
                      const pts = getPointsForOffer(offer.amount);
                      return (
                        <div
                          key={offer.campid}
                          className="stat-card flex flex-col hover:border-primary/50 transition-all group"
                        >
                          {/* Offer Header */}
                          <div className="flex items-start gap-3 mb-3">
                            {offer.image ? (
                              <img
                                src={offer.image}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover border border-border/50 shrink-0"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Star className="h-5 w-5 text-primary" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                                {offer.title}
                              </h3>
                              {offer.category && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground mt-1 inline-block">
                                  {offer.category}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-muted-foreground line-clamp-3 mb-4 flex-1">
                            {offer.description || "Complete this offer to earn points."}
                          </p>

                          {/* Reward & CTA */}
                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                            <div>
                              <p className="text-lg font-bold font-mono text-success">+{pts.toLocaleString()}</p>
                              <p className="text-[10px] text-muted-foreground">points (${parseFloat(offer.amount).toFixed(2)})</p>
                            </div>
                            <a
                              href={offer.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex"
                            >
                              <Button size="sm" variant="neon" className="gap-1.5">
                                Complete
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center mt-4">
                  {filteredOffers.length} offers available · Points are credited automatically after completion
                </p>
              </div>
            )}
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
