-- ═══════════════════════════════════════════════════════
-- Run this in Supabase → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════

-- 1. Create the config table
CREATE TABLE IF NOT EXISTS public.saill_config (
  id    TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- 2. Allow anyone to read and write (anon key access)
ALTER TABLE public.saill_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all reads"
  ON public.saill_config FOR SELECT
  USING (true);

CREATE POLICY "Allow all writes"
  ON public.saill_config FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all updates"
  ON public.saill_config FOR UPDATE
  USING (true);

-- 3. Confirm it works
SELECT 'saill_config table ready ✅' AS status;
