-- ROAD TO PRO — SUPABASE DATABASE SCHEMA DDL

CREATE TABLE IF NOT EXISTS public.user_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  state_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own state"
  ON public.user_states
  FOR ALL
  USING (auth.uid() = user_id);
