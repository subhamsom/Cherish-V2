-- User-facing calendar date for memories (distinct from created_at audit timestamp)

ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS memory_date DATE;

UPDATE public.memories
SET memory_date = (created_at AT TIME ZONE 'UTC')::date
WHERE memory_date IS NULL;

ALTER TABLE public.memories
  ALTER COLUMN memory_date SET DEFAULT CURRENT_DATE;

ALTER TABLE public.memories
  ALTER COLUMN memory_date SET NOT NULL;
