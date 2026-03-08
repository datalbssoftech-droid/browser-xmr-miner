
-- Add proxy configuration keys
INSERT INTO public.platform_config (key, value) VALUES
  ('proxy_url', 'wss://proxy.harimine.com'),
  ('proxy_enabled', 'false'),
  ('proxy_max_connections', '1000'),
  ('proxy_auth_required', 'true'),
  ('share_reward_rate', '0.000000001')
ON CONFLICT (key) DO NOTHING;

-- Create share_submissions table for tracking individual shares
CREATE TABLE public.share_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.mining_sessions(id) ON DELETE SET NULL,
  job_id TEXT NOT NULL,
  nonce TEXT NOT NULL,
  result TEXT NOT NULL,
  difficulty DOUBLE PRECISION NOT NULL DEFAULT 0,
  is_valid BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.share_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shares" ON public.share_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all shares" ON public.share_submissions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Index for fast lookups
CREATE INDEX idx_share_submissions_user ON public.share_submissions(user_id, created_at DESC);
CREATE INDEX idx_share_submissions_session ON public.share_submissions(session_id);
