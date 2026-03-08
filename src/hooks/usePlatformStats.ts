import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlatformStats {
  activeMiners: number;
  platformHashrate: number;
  totalMined: number;
  totalPaid: number;
}

async function fetchPlatformStats(): Promise<PlatformStats> {
  const [minersRes, earningsRes, withdrawalsRes, hashrateRes] = await Promise.all([
    supabase.from("mining_sessions").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("earnings").select("amount"),
    supabase.from("withdrawals").select("amount").eq("status", "completed"),
    supabase.from("mining_sessions").select("hashrate").eq("is_active", true),
  ]);

  const activeMiners = minersRes.count ?? 0;
  const totalMined = (earningsRes.data ?? []).reduce((s, r) => s + (r.amount ?? 0), 0);
  const totalPaid = (withdrawalsRes.data ?? []).reduce((s, r) => s + (r.amount ?? 0), 0);
  const platformHashrate = (hashrateRes.data ?? []).reduce((s, r) => s + (r.hashrate ?? 0), 0);

  return { activeMiners, platformHashrate, totalMined, totalPaid };
}

export const usePlatformStats = () =>
  useQuery({
    queryKey: ["platform-stats"],
    queryFn: fetchPlatformStats,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
