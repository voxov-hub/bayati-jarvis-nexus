CREATE TABLE public.memory_corrections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  message_topic text NOT NULL,
  predicted_tag text NOT NULL,
  corrected_tag text NOT NULL
);

ALTER TABLE public.memory_corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert corrections" ON public.memory_corrections FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can read corrections" ON public.memory_corrections FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated full access corrections" ON public.memory_corrections FOR ALL TO authenticated USING (true) WITH CHECK (true);