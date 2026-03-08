CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT json_build_object(
    'active_miners', (SELECT count(*) FROM mining_sessions WHERE is_active = true),
    'platform_hashrate', (SELECT coalesce(sum(hashrate), 0) FROM mining_sessions WHERE is_active = true),
    'total_mined', (SELECT coalesce(sum(amount), 0) FROM earnings),
    'total_paid', (SELECT coalesce(sum(amount), 0) FROM withdrawals WHERE status = 'completed')
  )
$$;