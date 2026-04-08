import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Users, Pickaxe, Wallet, Settings, Activity, CheckCircle, XCircle, Server, Wifi, WifiOff, Globe, Shield, Hash, BookOpen, Mail, Plus, Trash2, Edit, Gift, Coins } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [shares, setShares] = useState<any[]>([]);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [configSaving, setConfigSaving] = useState(false);
  const [testingProxy, setTestingProxy] = useState(false);
  const [proxyTestResult, setProxyTestResult] = useState<string | null>(null);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [newPost, setNewPost] = useState({ title: "", slug: "", excerpt: "", content: "", cover_image: "", is_published: false });
  const [offerCompletions, setOfferCompletions] = useState<any[]>([]);
  const [pointsRedemptions, setPointsRedemptions] = useState<any[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [p, s, w, c, sh, bp, ns, oc, pr] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("mining_sessions").select("*").order("started_at", { ascending: false }).limit(50),
      supabase.from("withdrawals").select("*").order("created_at", { ascending: false }),
      supabase.from("platform_config").select("*"),
      supabase.from("share_submissions").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
      supabase.from("newsletter_subscribers").select("*").order("subscribed_at", { ascending: false }),
      supabase.from("offer_completions").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("points_redemptions").select("*").order("created_at", { ascending: false }),
    ]);
    setUsers(p.data || []);
    setSessions(s.data || []);
    setWithdrawals(w.data || []);
    setShares(sh.data || []);
    setBlogPosts(bp.data || []);
    setSubscribers(ns.data || []);
    setOfferCompletions(oc.data || []);
    setPointsRedemptions(pr.data || []);
    const cfg: Record<string, string> = {};
    (c.data || []).forEach((item: any) => { cfg[item.key] = item.value; });
    setConfig(cfg);
  };

  const activeSessions = sessions.filter((s) => s.is_active);
  const totalHashrate = activeSessions.reduce((sum, s) => sum + s.hashrate, 0);
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");
  const validShares = shares.filter((s) => s.is_valid).length;
  const invalidShares = shares.filter((s) => !s.is_valid).length;

  const handleWithdrawal = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("withdrawals").update({ status, processed_at: new Date().toISOString() }).eq("id", id);
    if (error) toast.error("Failed to update withdrawal");
    else {
      toast.success(`Withdrawal ${status}`);
      fetchAll();
    }
  };

  const saveConfig = async () => {
    setConfigSaving(true);
    for (const [key, value] of Object.entries(config)) {
      const { data: existing } = await supabase.from("platform_config").select("id").eq("key", key).maybeSingle();
      if (existing) {
        await supabase.from("platform_config").update({ value }).eq("key", key);
      } else {
        await supabase.from("platform_config").insert({ key, value });
      }
    }
    toast.success("Configuration saved!");
    setConfigSaving(false);
  };

  const testProxyConnection = async () => {
    setTestingProxy(true);
    setProxyTestResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("mining-proxy", {
        method: "GET",
      });
      if (error) throw error;
      setProxyTestResult(`✅ Edge function responding. Pool: ${data.pool_url}:${data.pool_port} | Proxy enabled: ${data.proxy_enabled}`);
    } catch (err: any) {
      setProxyTestResult(`❌ Error: ${err.message}`);
    }
    setTestingProxy(false);
  };

  const proxyEnabled = config.proxy_enabled === "true";

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon={Users} label="Total Users" value={String(users.length)} />
          <StatCard icon={Pickaxe} label="Active Miners" value={String(activeSessions.length)} trend={activeSessions.length > 0 ? "up" : "neutral"} />
          <StatCard icon={Activity} label="Network Hashrate" value={`${totalHashrate.toFixed(0)} H/s`} />
          <StatCard icon={Hash} label="Shares" value={`${validShares} / ${validShares + invalidShares}`} subtitle={`${invalidShares} rejected`} />
          <StatCard icon={Wallet} label="Pending Withdrawals" value={String(pendingWithdrawals.length)} />
        </div>

        <Tabs defaultValue="proxy">
          <TabsList className="bg-secondary border border-border mb-6 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="proxy">Proxy & Pool</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="shares">Shares</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
            <TabsTrigger value="config">Platform</TabsTrigger>
          </TabsList>

          {/* ─── Proxy & Pool Configuration ─── */}
          <TabsContent value="proxy">
            <div className="space-y-6">
              {/* Proxy Status */}
              <div className="stat-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Mining Proxy</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{proxyEnabled ? "Enabled" : "Disabled"}</span>
                    <Switch
                      checked={proxyEnabled}
                      onCheckedChange={(checked) => setConfig({ ...config, proxy_enabled: checked ? "true" : "false" })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-secondary text-sm font-mono">
                  {proxyEnabled ? (
                    <Wifi className="h-4 w-4 text-success shrink-0" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-muted-foreground truncate">{config.proxy_url || "Not configured"}</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Proxy WebSocket URL</Label>
                    <Input
                      value={config.proxy_url || ""}
                      onChange={(e) => setConfig({ ...config, proxy_url: e.target.value })}
                      placeholder="wss://proxy.yourdomain.com"
                      className="mt-1 bg-secondary border-border font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Your deployed WebSocket proxy server URL
                    </p>
                  </div>
                  <div>
                    <Label>Max Connections</Label>
                    <Input
                      value={config.proxy_max_connections || ""}
                      onChange={(e) => setConfig({ ...config, proxy_max_connections: e.target.value })}
                      placeholder="1000"
                      type="number"
                      className="mt-1 bg-secondary border-border font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Switch
                    checked={config.proxy_auth_required !== "false"}
                    onCheckedChange={(checked) => setConfig({ ...config, proxy_auth_required: checked ? "true" : "false" })}
                  />
                  <div>
                    <span className="text-sm font-medium">Require Authentication</span>
                    <p className="text-xs text-muted-foreground">Miners must provide a valid JWT to connect</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="neon" onClick={saveConfig} disabled={configSaving}>
                    {configSaving ? "Saving..." : "Save Proxy Config"}
                  </Button>
                  <Button variant="neon-outline" onClick={testProxyConnection} disabled={testingProxy}>
                    {testingProxy ? "Testing..." : "Test Connection"}
                  </Button>
                </div>
                {proxyTestResult && (
                  <div className="mt-3 px-3 py-2 rounded-lg bg-secondary text-sm font-mono">
                    {proxyTestResult}
                  </div>
                )}
              </div>

              {/* Pool Configuration */}
              <div className="stat-card">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Mining Pool Configuration</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure the Stratum pool your proxy connects to. Changes apply to new mining sessions.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Pool URL</Label>
                    <Input
                      value={config.pool_url || ""}
                      onChange={(e) => setConfig({ ...config, pool_url: e.target.value })}
                      placeholder="pool.supportxmr.com"
                      className="mt-1 bg-secondary border-border font-mono text-sm"
                    />
                  </div>
                  <div>
                    <Label>Pool Port</Label>
                    <Input
                      value={config.pool_port || ""}
                      onChange={(e) => setConfig({ ...config, pool_port: e.target.value })}
                      placeholder="3333"
                      type="number"
                      className="mt-1 bg-secondary border-border font-mono text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Pool Wallet Address</Label>
                    <Input
                      value={config.pool_wallet || ""}
                      onChange={(e) => setConfig({ ...config, pool_wallet: e.target.value })}
                      placeholder="4..."
                      className="mt-1 bg-secondary border-border font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      The XMR wallet address used for pool payouts (platform wallet)
                    </p>
                  </div>
                  <div>
                    <Label>Worker Name Prefix</Label>
                    <Input
                      value={config.worker_prefix || ""}
                      onChange={(e) => setConfig({ ...config, worker_prefix: e.target.value })}
                      placeholder="harimine"
                      className="mt-1 bg-secondary border-border font-mono text-sm"
                    />
                  </div>
                  <div>
                    <Label>Pool Password</Label>
                    <Input
                      value={config.pool_password || ""}
                      onChange={(e) => setConfig({ ...config, pool_password: e.target.value })}
                      placeholder="x"
                      className="mt-1 bg-secondary border-border font-mono text-sm"
                    />
                  </div>
                </div>
                <Button variant="neon" className="mt-6" onClick={saveConfig} disabled={configSaving}>
                  {configSaving ? "Saving..." : "Save Pool Config"}
                </Button>
              </div>

              {/* Reward Configuration */}
              <div className="stat-card">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Reward & Fee Settings</h3>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label>Share Reward Rate (XMR)</Label>
                    <Input
                      value={config.share_reward_rate || ""}
                      onChange={(e) => setConfig({ ...config, share_reward_rate: e.target.value })}
                      placeholder="0.000000001"
                      className="mt-1 bg-secondary border-border font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">XMR per share × difficulty</p>
                  </div>
                  <div>
                    <Label>Platform Fee (%)</Label>
                    <Input
                      value={config.platform_fee || ""}
                      onChange={(e) => setConfig({ ...config, platform_fee: e.target.value })}
                      placeholder="5"
                      type="number"
                      className="mt-1 bg-secondary border-border font-mono text-sm"
                    />
                  </div>
                  <div>
                    <Label>Custom Domain</Label>
                    <Input
                      value={config.site_domain || ""}
                      onChange={(e) => setConfig({ ...config, site_domain: e.target.value })}
                      placeholder="shrimine.com"
                      className="mt-1 bg-secondary border-border font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Used in referral links</p>
                  </div>
                </div>
                <Button variant="neon" className="mt-6" onClick={saveConfig} disabled={configSaving}>
                  {configSaving ? "Saving..." : "Save Reward Settings"}
                </Button>
              </div>

              {/* Referral Configuration */}
              <div className="stat-card">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Referral Settings</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure referral program commission rates and bonuses.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label>Referral Commission (%)</Label>
                    <Input
                      value={config.referral_percentage || ""}
                      onChange={(e) => setConfig({ ...config, referral_percentage: e.target.value })}
                      placeholder="5"
                      type="number"
                      className="mt-1 bg-secondary border-border font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">% of referred user's earnings</p>
                  </div>
                  <div>
                    <Label>Signup Bonus (XMR)</Label>
                    <Input
                      value={config.referral_signup_bonus || ""}
                      onChange={(e) => setConfig({ ...config, referral_signup_bonus: e.target.value })}
                      placeholder="0.0001"
                      className="mt-1 bg-secondary border-border font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Bonus for referrer on signup</p>
                  </div>
                  <div>
                    <Label>Mining Bonus (%)</Label>
                    <Input
                      value={config.referral_mining_bonus || ""}
                      onChange={(e) => setConfig({ ...config, referral_mining_bonus: e.target.value })}
                      placeholder="2"
                      type="number"
                      className="mt-1 bg-secondary border-border font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Extra % for referred user</p>
                  </div>
                </div>
                <Button variant="neon" className="mt-6" onClick={saveConfig} disabled={configSaving}>
                  {configSaving ? "Saving..." : "Save Referral Settings"}
                </Button>
              </div>

              {/* API Documentation */}
              <div className="stat-card">
                <h3 className="font-semibold mb-3">Proxy Server API Reference</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your proxy server should call these endpoints to integrate with the platform:
                </p>
                <div className="space-y-3 font-mono text-sm">
                  {[
                    { method: "GET", desc: "Fetch pool/proxy configuration", action: "" },
                    { method: "POST", desc: "Validate miner JWT token", action: '{ "action": "auth", "token": "..." }' },
                    { method: "POST", desc: "Record an accepted share", action: '{ "action": "submit_share", "user_id": "...", "job_id": "...", "nonce": "...", "result": "...", "difficulty": 1000, "is_valid": true }' },
                    { method: "POST", desc: "Update session hashrate", action: '{ "action": "update_session", "user_id": "...", "hashrate": 45.2, "total_hashes": 50000 }' },
                    { method: "POST", desc: "End mining session", action: '{ "action": "end_session", "user_id": "...", "total_hashes": 50000 }' },
                  ].map(({ method, desc, action }, i) => (
                    <div key={i} className="p-3 rounded-lg bg-secondary border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${method === "GET" ? "bg-primary/20 text-primary" : "bg-success/20 text-success"}`}>
                          {method}
                        </span>
                        <span className="text-foreground text-xs">/functions/v1/mining-proxy</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{desc}</p>
                      {action && <code className="text-xs text-muted-foreground break-all">{action}</code>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ─── Withdrawals ─── */}
          <TabsContent value="withdrawals">
            <div className="stat-card">
              <h3 className="font-semibold mb-4">Withdrawal Requests</h3>
              {withdrawals.length === 0 ? (
                <p className="text-muted-foreground text-sm">No withdrawal requests.</p>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map((w) => (
                    <div key={w.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div>
                        <p className="font-mono text-sm">{w.amount.toFixed(6)} XMR</p>
                        <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">{w.wallet_address}</p>
                        <p className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {w.status === "pending" ? (
                          <>
                            <Button size="sm" variant="ghost" className="text-success" onClick={() => handleWithdrawal(w.id, "approved")}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleWithdrawal(w.id, "rejected")}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <span className={`text-xs px-2 py-1 rounded-full ${w.status === "approved" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                            {w.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ─── Users ─── */}
          <TabsContent value="users">
            <div className="stat-card">
              <h3 className="font-semibold mb-4">All Users ({users.length})</h3>
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{u.display_name || "Unnamed"}</p>
                      <p className="text-xs text-muted-foreground font-mono truncate max-w-[300px]">{u.wallet_address || "No wallet"}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ─── Sessions ─── */}
          <TabsContent value="sessions">
            <div className="stat-card">
              <h3 className="font-semibold mb-4">Mining Sessions ({sessions.length})</h3>
              <div className="space-y-3">
                {sessions.slice(0, 30).map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-mono">{s.hashrate.toFixed(0)} H/s · {s.threads} threads · {s.cpu_usage}% CPU</p>
                      <p className="text-xs text-muted-foreground">{new Date(s.started_at).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground font-mono">Hashes: {(s.total_hashes || 0).toLocaleString()}</p>
                    </div>
                    <div className={`h-2.5 w-2.5 rounded-full ${s.is_active ? "bg-success animate-pulse-neon" : "bg-muted-foreground"}`} />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ─── Shares ─── */}
          <TabsContent value="shares">
            <div className="stat-card">
              <h3 className="font-semibold mb-4">
                Share Submissions — {validShares} accepted, {invalidShares} rejected
              </h3>
              {shares.length === 0 ? (
                <p className="text-muted-foreground text-sm">No shares submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {shares.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div>
                        <p className="text-sm font-mono">Job: {s.job_id.slice(0, 12)}... · Nonce: {s.nonce}</p>
                        <p className="text-xs text-muted-foreground">Difficulty: {s.difficulty} · {new Date(s.created_at).toLocaleString()}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${s.is_valid ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                        {s.is_valid ? "valid" : "invalid"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ─── Blog Management ─── */}
          <TabsContent value="blog">
            <div className="space-y-6">
              {/* Add/Edit Post Form */}
              <div className="stat-card">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{editingPost ? "Edit Post" : "Add New Post"}</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={editingPost?.title ?? newPost.title}
                      onChange={(e) => editingPost ? setEditingPost({ ...editingPost, title: e.target.value }) : setNewPost({ ...newPost, title: e.target.value })}
                      placeholder="Post title"
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input
                      value={editingPost?.slug ?? newPost.slug}
                      onChange={(e) => editingPost ? setEditingPost({ ...editingPost, slug: e.target.value }) : setNewPost({ ...newPost, slug: e.target.value })}
                      placeholder="post-url-slug"
                      className="mt-1 bg-secondary border-border font-mono text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Excerpt</Label>
                    <Input
                      value={editingPost?.excerpt ?? newPost.excerpt}
                      onChange={(e) => editingPost ? setEditingPost({ ...editingPost, excerpt: e.target.value }) : setNewPost({ ...newPost, excerpt: e.target.value })}
                      placeholder="Short description"
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Cover Image URL</Label>
                    <Input
                      value={editingPost?.cover_image ?? newPost.cover_image}
                      onChange={(e) => editingPost ? setEditingPost({ ...editingPost, cover_image: e.target.value }) : setNewPost({ ...newPost, cover_image: e.target.value })}
                      placeholder="https://..."
                      className="mt-1 bg-secondary border-border font-mono text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Content</Label>
                    <Textarea
                      value={editingPost?.content ?? newPost.content}
                      onChange={(e) => editingPost ? setEditingPost({ ...editingPost, content: e.target.value }) : setNewPost({ ...newPost, content: e.target.value })}
                      placeholder="Write your post content here..."
                      rows={6}
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingPost?.is_published ?? newPost.is_published}
                      onCheckedChange={(checked) => editingPost ? setEditingPost({ ...editingPost, is_published: checked }) : setNewPost({ ...newPost, is_published: checked })}
                    />
                    <span className="text-sm">Publish immediately</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="neon" onClick={async () => {
                    const postData = editingPost || newPost;
                    if (!postData.title || !postData.slug || !postData.content) {
                      toast.error("Title, slug, and content are required");
                      return;
                    }
                    if (editingPost) {
                      const { error } = await supabase.from("blog_posts").update({
                        title: postData.title,
                        slug: postData.slug,
                        excerpt: postData.excerpt,
                        content: postData.content,
                        cover_image: postData.cover_image,
                        is_published: postData.is_published,
                        published_at: postData.is_published ? new Date().toISOString() : null,
                      }).eq("id", editingPost.id);
                      if (error) toast.error("Failed to update post");
                      else { toast.success("Post updated!"); setEditingPost(null); fetchAll(); }
                    } else {
                      const { error } = await supabase.from("blog_posts").insert({
                        ...postData,
                        published_at: postData.is_published ? new Date().toISOString() : null,
                      });
                      if (error) toast.error("Failed to create post");
                      else { toast.success("Post created!"); setNewPost({ title: "", slug: "", excerpt: "", content: "", cover_image: "", is_published: false }); fetchAll(); }
                    }
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    {editingPost ? "Update Post" : "Create Post"}
                  </Button>
                  {editingPost && (
                    <Button variant="neon-outline" onClick={() => setEditingPost(null)}>Cancel</Button>
                  )}
                </div>
              </div>

              {/* Posts List */}
              <div className="stat-card">
                <h3 className="font-semibold mb-4">All Posts ({blogPosts.length})</h3>
                {blogPosts.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No blog posts yet.</p>
                ) : (
                  <div className="space-y-3">
                    {blogPosts.map((post) => (
                      <div key={post.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                        <div>
                          <p className="font-medium">{post.title}</p>
                          <p className="text-xs text-muted-foreground font-mono">/{post.slug} · {new Date(post.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${post.is_published ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                            {post.is_published ? "Published" : "Draft"}
                          </span>
                          <Button size="sm" variant="ghost" onClick={() => setEditingPost(post)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => {
                            if (!confirm("Delete this post?")) return;
                            await supabase.from("blog_posts").delete().eq("id", post.id);
                            toast.success("Post deleted");
                            fetchAll();
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ─── Offers & Redemptions ─── */}
          <TabsContent value="offers">
            <div className="space-y-6">
              {/* CPAGrip Config */}
              <div className="stat-card">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">CPAGrip Offerwall Settings</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>CPAGrip User ID</Label>
                    <Input
                      value={config.cpagrip_user_id || ""}
                      onChange={(e) => setConfig({ ...config, cpagrip_user_id: e.target.value })}
                      placeholder="2509566"
                      className="mt-1 bg-secondary border-border font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Your affiliate ID from CPAGrip</p>
                  </div>
                  <div>
                    <Label>CPAGrip Public Key</Label>
                    <Input
                      value={config.cpagrip_pubkey || ""}
                      onChange={(e) => setConfig({ ...config, cpagrip_pubkey: e.target.value })}
                      placeholder="1f17662576f41ab825bb6caf03ff8635"
                      className="mt-1 bg-secondary border-border font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Public key for client-side JSON feed</p>
                  </div>
                  <div>
                    <Label>Points per Dollar</Label>
                    <Input
                      value={config.points_per_dollar || "1000"}
                      onChange={(e) => setConfig({ ...config, points_per_dollar: e.target.value })}
                      placeholder="1000"
                      type="number"
                      className="mt-1 bg-secondary border-border font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">How many points = $1.00</p>
                  </div>
                  <div>
                    <Label>Min Redemption Points</Label>
                    <Input
                      value={config.min_redemption_points || "1000"}
                      onChange={(e) => setConfig({ ...config, min_redemption_points: e.target.value })}
                      placeholder="1000"
                      type="number"
                      className="mt-1 bg-secondary border-border font-mono text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Postback URL (set in CPAGrip → Postback Tools)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cpagrip-postback?user_id={subid}&offer_id={offer_id}&offer_name={offer_name}&payout={payout}&transaction_id={transaction_id}&ip={ip}`}
                        readOnly
                        className="bg-secondary border-border font-mono text-xs"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                      <Button variant="neon-outline" size="sm" type="button" onClick={() => {
                        navigator.clipboard.writeText(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cpagrip-postback?user_id={subid}&offer_id={offer_id}&offer_name={offer_name}&payout={payout}&transaction_id={transaction_id}&ip={ip}`);
                        toast.success("Postback URL copied!");
                      }}>Copy</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Copy this URL to your CPAGrip postback settings</p>
                  </div>
                  <div className="sm:col-span-2">
                    <Label>JSON Feed Preview URL</Label>
                    <Input
                      value={config.cpagrip_user_id && config.cpagrip_pubkey ? `https://www.cpagrip.com/common/offer_feed_json.php?user_id=${config.cpagrip_user_id}&pubkey=${config.cpagrip_pubkey}&tracking_id={user_id}` : "Configure User ID and Public Key first"}
                      readOnly
                      className="mt-1 bg-secondary border-border font-mono text-xs"
                    />
                  </div>
                </div>
                <Button variant="neon" onClick={saveConfig} disabled={configSaving}>
                  {configSaving ? "Saving..." : "Save Offerwall Settings"}
                </Button>
              </div>

              {/* Redemption Requests */}
              <div className="stat-card">
                <div className="flex items-center gap-2 mb-4">
                  <Coins className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Point Redemption Requests ({pointsRedemptions.length})</h3>
                </div>
                {pointsRedemptions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No redemption requests.</p>
                ) : (
                  <div className="space-y-3">
                    {pointsRedemptions.map((r) => (
                      <div key={r.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                        <div>
                          <p className="font-mono text-sm">{r.points} pts → ${r.amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">{r.wallet_address}</p>
                          <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {r.status === "pending" ? (
                            <>
                              <Button size="sm" variant="ghost" className="text-success" onClick={async () => {
                                const { error } = await supabase.from("points_redemptions").update({ status: "approved", processed_at: new Date().toISOString() }).eq("id", r.id);
                                if (error) toast.error("Failed");
                                else {
                                  // Update redeemed points
                                  const { data: bal } = await supabase.from("points_balance").select("*").eq("user_id", r.user_id).maybeSingle();
                                  if (bal) {
                                    await supabase.from("points_balance").update({ redeemed_points: bal.redeemed_points + r.points }).eq("user_id", r.user_id);
                                  }
                                  toast.success("Redemption approved!");
                                  fetchAll();
                                }
                              }}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => {
                                const { error } = await supabase.from("points_redemptions").update({ status: "rejected", processed_at: new Date().toISOString() }).eq("id", r.id);
                                if (error) toast.error("Failed");
                                else { toast.success("Redemption rejected"); fetchAll(); }
                              }}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <span className={`text-xs px-2 py-1 rounded-full ${r.status === "approved" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                              {r.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Offer Completions Log */}
              <div className="stat-card">
                <h3 className="font-semibold mb-4">Recent Offer Completions ({offerCompletions.length})</h3>
                {offerCompletions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No offer completions yet.</p>
                ) : (
                  <div className="space-y-3">
                    {offerCompletions.map((o) => (
                      <div key={o.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                        <div>
                          <p className="text-sm font-medium">{o.offer_name || "Unknown Offer"}</p>
                          <p className="text-xs text-muted-foreground font-mono">User: {o.user_id.slice(0, 8)}... · TXN: {o.transaction_id || "N/A"}</p>
                          <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-success">+{o.points_earned} pts</p>
                          <p className="text-xs text-muted-foreground">${o.payout.toFixed(3)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ─── Newsletter Management ─── */}
          <TabsContent value="newsletter">
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Newsletter Subscribers ({subscribers.length})</h3>
              </div>
              {subscribers.length === 0 ? (
                <p className="text-muted-foreground text-sm">No subscribers yet.</p>
              ) : (
                <div className="space-y-3">
                  {subscribers.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div>
                        <p className="font-mono text-sm">{sub.email}</p>
                        <p className="text-xs text-muted-foreground">{new Date(sub.subscribed_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${sub.is_active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                          {sub.is_active ? "Active" : "Unsubscribed"}
                        </span>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => {
                          await supabase.from("newsletter_subscribers").delete().eq("id", sub.id);
                          toast.success("Subscriber removed");
                          fetchAll();
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ─── Platform Config ─── */}
          <TabsContent value="config">
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">General Platform Settings</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Min Withdrawal (XMR)</Label>
                  <Input
                    value={config.min_withdrawal || ""}
                    onChange={(e) => setConfig({ ...config, min_withdrawal: e.target.value })}
                    className="mt-1 bg-secondary border-border font-mono text-sm"
                  />
                </div>
              </div>
              <Button variant="neon" className="mt-6" onClick={saveConfig} disabled={configSaving}>
                {configSaving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminPage;
