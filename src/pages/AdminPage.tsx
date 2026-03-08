import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Users, Pickaxe, Wallet, Settings, Activity, CheckCircle, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [configSaving, setConfigSaving] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [p, s, w, c] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("mining_sessions").select("*").order("started_at", { ascending: false }).limit(50),
      supabase.from("withdrawals").select("*").order("created_at", { ascending: false }),
      supabase.from("platform_config").select("*"),
    ]);
    setUsers(p.data || []);
    setSessions(s.data || []);
    setWithdrawals(w.data || []);
    const cfg: Record<string, string> = {};
    (c.data || []).forEach((item: any) => { cfg[item.key] = item.value; });
    setConfig(cfg);
  };

  const activeSessions = sessions.filter((s) => s.is_active);
  const totalHashrate = activeSessions.reduce((sum, s) => sum + s.hashrate, 0);
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");

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
      await supabase.from("platform_config").update({ value }).eq("key", key);
    }
    toast.success("Configuration saved!");
    setConfigSaving(false);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Total Users" value={String(users.length)} />
          <StatCard icon={Pickaxe} label="Active Miners" value={String(activeSessions.length)} trend="up" />
          <StatCard icon={Activity} label="Network Hashrate" value={`${totalHashrate.toFixed(0)} H/s`} />
          <StatCard icon={Wallet} label="Pending Withdrawals" value={String(pendingWithdrawals.length)} />
        </div>

        <Tabs defaultValue="withdrawals">
          <TabsList className="bg-secondary border border-border mb-6">
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
          </TabsList>

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

          <TabsContent value="users">
            <div className="stat-card">
              <h3 className="font-semibold mb-4">All Users</h3>
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

          <TabsContent value="sessions">
            <div className="stat-card">
              <h3 className="font-semibold mb-4">Mining Sessions</h3>
              <div className="space-y-3">
                {sessions.slice(0, 20).map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-mono">{s.hashrate.toFixed(0)} H/s · {s.threads} threads</p>
                      <p className="text-xs text-muted-foreground">{new Date(s.started_at).toLocaleString()}</p>
                    </div>
                    <div className={`h-2.5 w-2.5 rounded-full ${s.is_active ? "bg-success animate-pulse-neon" : "bg-muted-foreground"}`} />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="config">
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Platform Configuration</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { key: "pool_url", label: "Pool URL" },
                  { key: "pool_port", label: "Pool Port" },
                  { key: "pool_wallet", label: "Pool Wallet" },
                  { key: "worker_prefix", label: "Worker Prefix" },
                  { key: "pool_password", label: "Pool Password" },
                  { key: "min_withdrawal", label: "Min Withdrawal (XMR)" },
                  { key: "platform_fee", label: "Platform Fee (%)" },
                  { key: "referral_percentage", label: "Referral %" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <Label>{label}</Label>
                    <Input
                      value={config[key] || ""}
                      onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                      className="mt-1 bg-secondary border-border font-mono text-sm"
                    />
                  </div>
                ))}
              </div>
              <Button variant="neon" className="mt-6" onClick={saveConfig} disabled={configSaving}>
                {configSaving ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminPage;
