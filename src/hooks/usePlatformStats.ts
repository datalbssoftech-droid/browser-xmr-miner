import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformStats {
  activeMiners: number;
  platformHashrate: number;
  totalMined: number;
  totalPaid: number;
}

function formatHashrate(h: number): string {
  if (h >= 1e6) return `${(h / 1e6).toFixed(1)} MH/s`;
  if (h >= 1e3) return `${(h / 1e3).toFixed(1)} KH/s`;
  return `${h.toFixed(0)} H/s`;
}

async function fetchPlatformStats(): Promise<PlatformStats> {
  const { data, error } = await supabase.rpc("get_platform_stats" as any);
  if (error) throw error;
  const d = data as any;
  return {
    activeMiners: d?.active_miners ?? 0,
    platformHashrate: d?.platform_hashrate ?? 0,
    totalMined: d?.total_mined ?? 0,
    totalPaid: d?.total_paid ?? 0,
  };
}

export const usePlatformStats = () =>
  useQuery({
    queryKey: ["platform-stats"],
    queryFn: fetchPlatformStats,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

export { formatHashrate };
