
-- Offer completions table for CPAGrip tracking
CREATE TABLE public.offer_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  offer_id TEXT NOT NULL,
  offer_name TEXT,
  points_earned INTEGER NOT NULL DEFAULT 0,
  payout DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  ip_address TEXT,
  transaction_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Points balance table (aggregate view)
CREATE TABLE public.points_balance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  redeemed_points INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Points redemption requests
CREATE TABLE public.points_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  wallet_address TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.offer_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS for offer_completions
CREATE POLICY "Users can view own offers" ON public.offer_completions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage offers" ON public.offer_completions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Allow postback inserts" ON public.offer_completions FOR INSERT TO anon WITH CHECK (true);

-- RLS for points_balance
CREATE POLICY "Users can view own balance" ON public.points_balance FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage balances" ON public.points_balance FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Allow postback upsert" ON public.points_balance FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow postback update" ON public.points_balance FOR UPDATE TO anon USING (true);

-- RLS for points_redemptions
CREATE POLICY "Users can view own redemptions" ON public.points_redemptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can request redemptions" ON public.points_redemptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage redemptions" ON public.points_redemptions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
