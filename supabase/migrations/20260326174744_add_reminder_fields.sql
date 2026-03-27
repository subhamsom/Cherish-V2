ALTER TABLE reminders ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS recurrence TEXT CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly', 'yearly')) DEFAULT 'none';
