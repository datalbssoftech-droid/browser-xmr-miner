
-- Remove overly permissive anon policies
DROP POLICY IF EXISTS "Allow postback inserts" ON public.offer_completions;
DROP POLICY IF EXISTS "Allow postback upsert" ON public.points_balance;
DROP POLICY IF EXISTS "Allow postback update" ON public.points_balance;
