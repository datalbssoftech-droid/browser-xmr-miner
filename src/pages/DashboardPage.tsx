import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Pickaxe, Zap, Wallet, TrendingUp, Clock, Hash } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const DashboardPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [s, e, w] = await Promise.all([
        supabase.from("mining_sessions").select("*").eq("user_id", user.id).order("started_at", { ascending: false }).limit(20),
        supabase.from("earnings").select("*").eq("user_id", user.id),
        supabase.from("withdrawals").select("*").eq("user_id", user.id),
      ]);
      setSessions(s.data || []);
      setEarnings(e.data || []);
      setWithdrawals(w.data || []);
    };
    fetchData();
  }, [user]);

  const totalMined = earnings.reduce((sum, e) => sum + e.amount, 0);
  const totalWithdrawn = withdrawals.filter((w) => w.status === "approved").reduce((sum, w) => sum + w.amount, 0);
  const pendingBalance = totalMined - totalWithdrawn;
  const activeSessions = sessions.filter((s) => s.is_active);
  const totalHashes = sessions.reduce((sum, s) => sum + (s.total_hashes || 0), 0);

  // Mock hashrate chart data
  const chartData = Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 2}h`,
    hashrate: Math.floor(Math.random() * 80 + 20),
  }));

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your mining overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Zap} label="Current Hashrate" value={activeSessions.length > 0 ? `${activeSessions[0]?.hashrate || 0} H/s` : "0 H/s"} trend={activeSessions.length > 0 ? "up" : "neutral"} />
          <StatCard icon={Hash} label="Total Hashes" value={totalHashes.toLocaleString()} />
          <StatCard icon={Wallet} label="Pending Balance" value={`${pendingBalance.toFixed(6)} XMR`} subtitle="Available for withdrawal" />
          <StatCard icon={TrendingUp} label="Total Mined" value={`${totalMined.toFixed(6)} XMR`} trend="up" />
        </div>

        {/* Chart */}
        <div className="stat-card mb-8">
          <h3 className="font-semibold mb-4">Hashrate Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="time" stroke="hsl(215 20% 55%)" fontSize={12} />
                <YAxis stroke="hsl(215 20% 55%)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "hsl(222 47% 8%)", border: "1px solid hsl(222 30% 16%)", borderRadius: "8px" }}
                  labelStyle={{ color: "hsl(210 40% 96%)" }}
                />
                <Line type="monotone" dataKey="hashrate" stroke="hsl(199 89% 48%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Stats */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="stat-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Pickaxe className="h-4 w-4 text-primary" />
              Active Workers
            </h3>
            <p className="text-3xl font-bold font-mono">{activeSessions.length}</p>
            <p className="text-sm text-muted-foreground mt-1">{sessions.length} total sessions</p>
          </div>
          <div className="stat-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Withdrawals
            </h3>
            <p className="text-3xl font-bold font-mono">{totalWithdrawn.toFixed(6)} XMR</p>
            <p className="text-sm text-muted-foreground mt-1">{withdrawals.length} total requests</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
