CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_email CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$')
);

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo_url TEXT,
  relationship_start_date DATE,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_user_partner UNIQUE(user_id)
);

CREATE INDEX idx_partners_user_id ON partners(user_id);

CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (
    type IN ('text', 'voice', 'photo', 'gift', 'occasion')
  ),
  content TEXT NOT NULL,
  audio_url TEXT,
  image_url TEXT,
  category TEXT,
  price DECIMAL(10, 2),
  tags TEXT[],
  liked BOOLEAN DEFAULT FALSE,
  pinned BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_content CHECK (LENGTH(content) > 0)
);

CREATE INDEX idx_memories_partner_id_created_at ON memories(partner_id, created_at DESC);
CREATE INDEX idx_memories_user_id ON memories(user_id);
CREATE INDEX idx_memories_tags ON memories USING GIN(tags);
CREATE INDEX idx_memories_type ON memories(type);
CREATE INDEX idx_memories_liked ON memories(liked) WHERE liked = TRUE;

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('gift', 'occasion')),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT,
  reminder_time TIMESTAMP NOT NULL,
  lead_time_days INT,
  price DECIMAL(10, 2),
  completed BOOLEAN DEFAULT FALSE,
  snoozed_until TIMESTAMP,
  recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_title CHECK (LENGTH(title) > 0),
  CONSTRAINT valid_date CHECK (date >= CURRENT_DATE)
);

CREATE INDEX idx_reminders_partner_id_date ON reminders(partner_id, date ASC);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_reminder_time ON reminders(reminder_time);
CREATE INDEX idx_reminders_completed ON reminders(completed) WHERE completed = FALSE;

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_user_tag UNIQUE(user_id, name),
  CONSTRAINT valid_name CHECK (LENGTH(name) > 0 AND LENGTH(name) <= 50)
);

CREATE INDEX idx_tags_user_id ON tags(user_id);

CREATE TABLE memory_tags (
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (memory_id, tag_id)
);

CREATE INDEX idx_memory_tags_tag_id ON memory_tags(tag_id);

CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  dark_mode BOOLEAN DEFAULT FALSE,
  font_size TEXT DEFAULT 'md',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  notification_frequency TEXT DEFAULT 'daily',
  notification_time TIME DEFAULT '09:00:00',
  reminder_lead_time INT DEFAULT 7,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users cannot delete profiles" ON users
  FOR DELETE USING (FALSE);

CREATE POLICY "Users can view own partner" ON partners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create partner" ON partners
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own partner" ON partners
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own partner" ON partners
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own memories" ON memories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create memories" ON memories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories" ON memories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories" ON memories
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reminders" ON reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create reminders" ON reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" ON reminders
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tags" ON tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create tags" ON tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags" ON tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" ON tags
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage memory tags" ON memory_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM memories
      WHERE memories.id = memory_id
        AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own memory files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'memories'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload memory files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'memories'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own memory files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'memories'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
