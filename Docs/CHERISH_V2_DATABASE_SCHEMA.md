# Cherish V2 — Database Schema

**Status:** Ready for Supabase  
**Tool:** Supabase PostgreSQL  
**Version Control:** Use `supabase migration` files (not manual edits)

---

## TABLES

### users
Authenticated users (from Google OAuth)

```sql
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
```

### partners
Person's partner (one per user in v2)

```sql
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
```

### memories
Core: texts, voice notes, photos, gift ideas, occasions

```sql
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (
    type IN ('text', 'voice', 'photo', 'gift', 'occasion')
  ),
  
  -- Content
  content TEXT NOT NULL,           -- Text, transcription, gift name, occasion name
  audio_url TEXT,                  -- Path to audio file in storage
  image_url TEXT,                  -- Path to image file in storage
  
  -- Metadata (for gifts, occasions)
  category TEXT,                   -- 'jewelry', 'experience', 'book', 'birthday', 'anniversary'
  price DECIMAL(10, 2),            -- For gift budgeting
  
  -- Tags & Status
  tags TEXT[],                     -- Array: ['happy', 'romantic', 'date-night']
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
```

### reminders
Birthdays, anniversaries, custom occasions, gift reminders

```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN ('gift', 'occasion')),
  title TEXT NOT NULL,             -- 'Birthday', 'Anniversary', 'First Date'
  date DATE NOT NULL,              -- Actual date (e.g., March 30)
  category TEXT,                   -- 'birthday', 'anniversary', 'custom'
  
  -- Notification Timing
  reminder_time TIMESTAMP NOT NULL, -- Exact time to send notification
  lead_time_days INT,              -- How many days before (1, 3, 7, 14)
  
  -- Gift-specific
  price DECIMAL(10, 2),            -- Budget for gift
  
  -- Status
  completed BOOLEAN DEFAULT FALSE,
  snoozed_until TIMESTAMP,         -- If user snoozed, when to show again
  recurring BOOLEAN DEFAULT FALSE, -- Repeat yearly?
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_title CHECK (LENGTH(title) > 0),
  CONSTRAINT valid_date CHECK (date >= CURRENT_DATE)
);

CREATE INDEX idx_reminders_partner_id_date ON reminders(partner_id, date ASC);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_reminder_time ON reminders(reminder_time);
CREATE INDEX idx_reminders_completed ON reminders(completed) WHERE completed = FALSE;
```

### tags
User-defined & system tags

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,                      -- Hex color for UI
  is_system BOOLEAN DEFAULT FALSE, -- System tags (happy, romantic, etc)
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_user_tag UNIQUE(user_id, name),
  CONSTRAINT valid_name CHECK (LENGTH(name) > 0 AND LENGTH(name) <= 50)
);

CREATE INDEX idx_tags_user_id ON tags(user_id);
```

### memory_tags
Junction table for many-to-many relationship

```sql
CREATE TABLE memory_tags (
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  
  PRIMARY KEY (memory_id, tag_id),
  CONSTRAINT max_tags_per_memory CHECK (
    -- Enforced at application level, not DB
  )
);

CREATE INDEX idx_memory_tags_tag_id ON memory_tags(tag_id);
```

### user_preferences
User settings & customization

```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Display
  dark_mode BOOLEAN DEFAULT FALSE,
  font_size TEXT DEFAULT 'md', -- 'sm', 'md', 'lg'
  
  -- Notifications
  notifications_enabled BOOLEAN DEFAULT TRUE,
  notification_frequency TEXT DEFAULT 'daily', -- 'never', 'daily', 'weekly', 'random'
  notification_time TIME DEFAULT '09:00:00', -- Time of day for prompts
  reminder_lead_time INT DEFAULT 7, -- Days before occasion (1, 3, 7, 14)
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## RELATIONSHIPS DIAGRAM

```
users (1)
  ├─ (many) partners
  ├─ (many) memories
  ├─ (many) reminders
  ├─ (many) tags
  └─ (1) user_preferences

partners (1)
  └─ (many) memories
  └─ (many) reminders

memories (many)
  ├─ (1) user
  ├─ (1) partner
  └─ (many) tags [via memory_tags junction table]

tags (many)
  └─ (many) memories [via memory_tags junction table]

reminders (many)
  ├─ (1) user
  └─ (1) partner
```

---

## ROW LEVEL SECURITY (RLS)

**Principle:** Users can ONLY see/edit their own data and their partner's data.

### users table RLS

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Only system can delete
CREATE POLICY "Users cannot delete profiles" ON users
  FOR DELETE USING (FALSE);
```

### partners table RLS

```sql
-- Users can view their own partner
CREATE POLICY "Users can view own partner" ON partners
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert one partner
CREATE POLICY "Users can create partner" ON partners
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own partner
CREATE POLICY "Users can update own partner" ON partners
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own partner
CREATE POLICY "Users can delete own partner" ON partners
  FOR DELETE USING (auth.uid() = user_id);
```

### memories table RLS

```sql
-- Users can view memories with their partner
CREATE POLICY "Users can view own memories" ON memories
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create memories
CREATE POLICY "Users can create memories" ON memories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update own memories
CREATE POLICY "Users can update own memories" ON memories
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete own memories
CREATE POLICY "Users can delete own memories" ON memories
  FOR DELETE USING (auth.uid() = user_id);
```

### reminders table RLS

```sql
-- Users can view their reminders
CREATE POLICY "Users can view own reminders" ON reminders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create reminders
CREATE POLICY "Users can create reminders" ON reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update own reminders
CREATE POLICY "Users can update own reminders" ON reminders
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete own reminders
CREATE POLICY "Users can delete own reminders" ON reminders
  FOR DELETE USING (auth.uid() = user_id);
```

### tags table RLS

```sql
CREATE POLICY "Users can view own tags" ON tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create tags" ON tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags" ON tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" ON tags
  FOR DELETE USING (auth.uid() = user_id);
```

### memory_tags table RLS

```sql
-- Controlled via memories RLS (indirect access)
CREATE POLICY "Users can manage memory tags" ON memory_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memories
      WHERE memories.id = memory_id
      AND memories.user_id = auth.uid()
    )
  );
```

---

## STORAGE BUCKETS

### memories
Audio files, images for memories

```
Structure:
  memories/
  ├─ {user_id}/
  │   ├─ {memory_id}/
  │   │   ├─ audio.wav
  │   │   ├─ audio.mp3
  │   │   └─ image.jpg
```

**RLS:** Users can only access their own folder

```sql
-- Bucket: memories

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
```

### profiles
User avatars, partner photos

```
Structure:
  profiles/
  ├─ {user_id}/
  │   └─ avatar.jpg
  ├─ {partner_id}/
  │   └─ photo.jpg
```

---

## SETUP INSTRUCTIONS

### 1. Create Supabase Project

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login
supabase login

# Create project (or link existing)
supabase init
supabase link --project-ref <project-ref>
```

### 2. Create Tables (Via Migration)

```bash
# Create migration file
supabase migration new create_cherish_schema

# Edit migration file: supabase/migrations/timestamp_create_cherish_schema.sql
# Paste all CREATE TABLE statements above

# Run migration locally
supabase db push

# Deploy to production
supabase db push --linked
```

### 3. Enable RLS & Create Policies

```bash
# Same migration file, add RLS policies
# supabase/migrations/timestamp_create_cherish_schema.sql

# Run: supabase db push
```

### 4. Create Storage Buckets

Via Supabase Dashboard:
- Storage → Create Bucket → "memories"
- Storage → Create Bucket → "profiles"
- Add RLS policies (above)

### 5. Generate TypeScript Types

```bash
supabase gen types typescript > src/types/database.ts
```

---

## NOTES

- **Timestamps:** All use UTC (TIMESTAMP DEFAULT NOW())
- **UUIDs:** All IDs are UUID v4 (gen_random_uuid())
- **Cascading:** ON DELETE CASCADE for user data (if user deleted, all their data goes)
- **Indexes:** Created for common queries (filtering, sorting, searching)
- **RLS:** CRITICAL for security—verify policies before deploying
- **Migrations:** Always use `supabase migration` CLI, never manual edits
- **Backups:** Supabase auto-backs up daily; no manual backup needed
