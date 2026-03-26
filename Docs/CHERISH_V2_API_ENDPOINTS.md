# Cherish V2 — API Endpoints Specification

**Status:** Ready for Implementation  
**Framework:** Next.js App Router API Routes  
**Base Path:** `/api`

---

## AUTHENTICATION

### POST /api/auth/signin
Google OAuth sign-in

**Request:**
```typescript
{
  // Google OAuth token (from client)
  token: string
}
```

**Response (200):**
```typescript
{
  user: {
    id: string
    email: string
    name: string
    avatar_url: string
    created_at: string
  }
  session: {
    access_token: string
    refresh_token: string
    expires_at: number
  }
}
```

**Errors:**
- 401: Invalid token
- 500: OAuth provider error

---

### POST /api/auth/logout
Clear session

**Request:** None (headers contain session)

**Response (200):**
```typescript
{ success: true }
```

---

### GET /api/auth/me
Get current authenticated user

**Request:** None (headers contain session)

**Response (200):**
```typescript
{
  id: string
  email: string
  name: string
  avatar_url: string
  created_at: string
  preferences: {
    dark_mode: boolean
    notifications_enabled: boolean
    notification_frequency: 'never' | 'daily' | 'weekly' | 'random'
    notification_time: string // "09:00"
  }
}
```

**Errors:**
- 401: Unauthorized (no session)

---

## PARTNERS

### POST /api/partners
Create or update partner

**Request:**
```typescript
{
  name: string
  photo_url?: string
  relationship_start_date?: string // ISO date
  bio?: string
}
```

**Response (201):**
```typescript
{
  id: string
  user_id: string
  name: string
  photo_url: string | null
  relationship_start_date: string | null
  bio: string | null
  created_at: string
  updated_at: string
}
```

**Errors:**
- 400: Invalid input (name required)
- 401: Unauthorized
- 409: Partner already exists (v2 single partner only)

---

### GET /api/partners/:id
Get partner details with stats

**Response (200):**
```typescript
{
  id: string
  name: string
  photo_url: string | null
  relationship_start_date: string
  bio: string | null
  stats: {
    total_memories: number
    favorite_type: 'text' | 'voice' | 'photo' // Most common
    most_common_mood: string
    last_memory_date: string
    avg_memories_per_week: number
  }
}
```

---

### PUT /api/partners/:id
Update partner

**Request:**
```typescript
{
  name?: string
  photo_url?: string
  relationship_start_date?: string
  bio?: string
}
```

**Response (200):** Updated partner object

**Errors:**
- 404: Partner not found
- 401: Unauthorized

---

### DELETE /api/partners/:id
Delete partner (and all associated memories)

**Response (200):**
```typescript
{ success: true, deleted_memories: number }
```

**Errors:**
- 404: Partner not found
- 401: Unauthorized

---

## MEMORIES

### POST /api/memories
Create memory

**Request:**
```typescript
{
  partner_id: string
  type: 'text' | 'voice' | 'photo' | 'gift' | 'occasion'
  content: string // Text, transcription, gift name, occasion name
  audio_url?: string // Path after uploading to storage
  image_url?: string // Path after uploading to storage
  tags?: string[] // ['happy', 'romantic', 'date-night']
  category?: string // For gifts/occasions
  price?: number // For gifts
}
```

**Response (201):**
```typescript
{
  id: string
  user_id: string
  partner_id: string
  type: string
  content: string
  audio_url: string | null
  image_url: string | null
  tags: string[]
  liked: boolean
  pinned: boolean
  archived: boolean
  created_at: string
  updated_at: string
}
```

**Errors:**
- 400: Invalid input (content required)
- 401: Unauthorized
- 413: File too large (audio >10MB, image >20MB)

---

### GET /api/memories
List memories (paginated, filtered, sorted)

**Query Parameters:**
```typescript
{
  partner_id: string // Required
  sort?: 'newest' | 'oldest' | 'random' | 'mood' // Default: newest
  filter_type?: 'text' | 'voice' | 'photo' | 'gift' | 'occasion' // Optional
  filter_tags?: string[] // Optional, comma-separated
  search?: string // Search in content
  archived?: boolean // Include archived? Default: false
  limit?: number // Default: 20
  cursor?: string // For pagination
}
```

**Response (200):**
```typescript
{
  data: Memory[],
  hasMore: boolean,
  cursor: string | null
}
```

**Errors:**
- 400: Invalid query params
- 401: Unauthorized

---

### GET /api/memories/:id
Get single memory with related memories

**Response (200):**
```typescript
{
  id: string
  // ... all Memory fields
  relatedMemories: Memory[] // Memories with same tags
}
```

**Errors:**
- 404: Memory not found
- 401: Unauthorized

---

### PUT /api/memories/:id
Update memory

**Request:**
```typescript
{
  content?: string
  tags?: string[]
  image_url?: string
  category?: string
  price?: number
}
```

**Response (200):** Updated memory object

**Errors:**
- 404: Memory not found
- 401: Unauthorized

---

### DELETE /api/memories/:id
Delete memory

**Response (200):**
```typescript
{ success: true }
```

**Errors:**
- 404: Memory not found
- 401: Unauthorized

---

### POST /api/memories/:id/like
Toggle like on memory

**Response (200):**
```typescript
{
  id: string
  liked: boolean
  like_count: number
}
```

---

### POST /api/memories/:id/pin
Toggle pin on memory

**Response (200):**
```typescript
{
  id: string
  pinned: boolean
}
```

---

### POST /api/memories/:id/archive
Toggle archive on memory

**Response (200):**
```typescript
{
  id: string
  archived: boolean
}
```

---

## VOICE & MEDIA

### POST /api/voice/transcribe
Transcribe audio using Claude API

**Request:**
```typescript
// multipart/form-data
{
  audio: File // .wav, .mp3, max 10MB
}
```

**Response (200):**
```typescript
{
  transcription: string
  duration_seconds: number
  confidence: number // 0-1
}
```

**Errors:**
- 400: Invalid audio format
- 413: File too large
- 503: Claude API unavailable

---

### POST /api/media/upload
Upload image to storage

**Request:**
```typescript
// multipart/form-data
{
  file: File // .jpg, .png, max 20MB
  type: 'memory' | 'profile' // Where to store
}
```

**Response (200):**
```typescript
{
  url: string // Public URL
  path: string // Storage path
  size: number // Bytes
}
```

**Errors:**
- 400: Invalid file type
- 413: File too large
- 401: Unauthorized

---

## REMINDERS

### POST /api/reminders
Create reminder

**Request:**
```typescript
{
  partner_id: string
  type: 'gift' | 'occasion'
  title: string
  date: string // ISO date
  category?: string // 'birthday', 'anniversary', 'custom'
  lead_time_days?: number // 1, 3, 7, 14
  reminder_time?: string // "09:00" (overrides global setting)
  price?: number // For gifts
  recurring?: boolean // Default: false
}
```

**Response (201):**
```typescript
{
  id: string
  user_id: string
  partner_id: string
  type: string
  title: string
  date: string
  reminder_time: string
  category: string
  price: number | null
  completed: boolean
  recurring: boolean
  created_at: string
}
```

**Errors:**
- 400: Invalid input (title, date required)
- 401: Unauthorized

---

### GET /api/reminders
List reminders (filtered by type)

**Query Parameters:**
```typescript
{
  partner_id: string // Required
  type?: 'gift' | 'occasion' // Optional filter
  category?: string // e.g., 'birthday'
  completed?: boolean // Default: false (show upcoming)
}
```

**Response (200):**
```typescript
{
  upcoming: Reminder[] // Sorted by date
  gifts: Reminder[] // Gift ideas
  occasions: Reminder[] // Special dates
}
```

---

### PUT /api/reminders/:id
Update reminder

**Request:**
```typescript
{
  title?: string
  date?: string
  reminder_time?: string
  price?: number
  recurring?: boolean
}
```

**Response (200):** Updated reminder object

---

### POST /api/reminders/:id/complete
Mark reminder as completed

**Response (200):**
```typescript
{
  id: string
  completed: boolean
  completed_at: string
}
```

---

### POST /api/reminders/:id/snooze
Snooze reminder (defer notification)

**Request:**
```typescript
{
  snooze_days: number // 1, 7, or custom days
}
```

**Response (200):**
```typescript
{
  id: string
  snoozed_until: string // ISO timestamp
}
```

---

### DELETE /api/reminders/:id
Delete reminder

**Response (200):**
```typescript
{ success: true }
```

---

## INSIGHTS & ANALYTICS

### GET /api/insights/partner/:id
Get relationship insights and statistics

**Response (200):**
```typescript
{
  stats: {
    total_memories: number
    memory_count_by_type: { text: number, voice: number, photo: number, gift: number }
    favorite_type: string
    memory_count_by_mood: Record<string, number>
    avg_memories_per_week: number
    last_memory_date: string
    streak_days: number // Days with at least 1 memory
  },
  charts: {
    activity_by_week: Array<{ week: string, count: number }>
    mood_breakdown: Array<{ mood: string, percentage: number }>
  },
  insights: string[] // AI-generated insights (v4.1+)
}
```

**Errors:**
- 404: Partner not found
- 401: Unauthorized

---

### GET /api/insights/annual-report
Generate anniversary/annual report

**Response (200):**
```typescript
{
  title: string
  year: number
  cover_photo: string
  sections: {
    top_memories: Memory[]
    top_moods: Array<{ mood: string, count: number }>
    key_dates: Reminder[]
    stats: Record<string, number>
    ai_summary: string
  }
}
```

---

## TAGS

### GET /api/tags
List all tags for user

**Response (200):**
```typescript
{
  system_tags: Tag[] // Predefined: happy, romantic, grateful, etc.
  custom_tags: Tag[] // User-created tags
}
```

---

### POST /api/tags
Create custom tag

**Request:**
```typescript
{
  name: string
  color?: string // Hex color
}
```

**Response (201):**
```typescript
{
  id: string
  user_id: string
  name: string
  color: string | null
  is_system: false
}
```

**Errors:**
- 400: Tag name required
- 409: Tag already exists

---

## EXPORTS & DOWNLOADS

### GET /api/export/csv
Export all memories as CSV

**Response (200):**
```
CSV file download
Content-Type: text/csv
Filename: memories_export_2026-03-25.csv
```

---

### GET /api/export/json
Export all memories as JSON

**Response (200):**
```
JSON file download
Content-Type: application/json
Filename: memories_export_2026-03-25.json
```

---

### GET /api/export/pdf
Export memories as PDF report

**Response (200):**
```
PDF file download
Content-Type: application/pdf
Filename: memories_report_2026-03-25.pdf
```

---

## ERROR RESPONSES

All errors follow this format:

```typescript
{
  error: {
    code: string // 'MEMORY_NOT_FOUND', 'UNAUTHORIZED', 'INVALID_INPUT'
    message: string // User-friendly message
    details?: Record<string, any> // Additional context
  }
}
```

**Common Status Codes:**
- 200: Success
- 201: Created
- 400: Bad request (validation error)
- 401: Unauthorized (missing/invalid session)
- 404: Not found
- 409: Conflict (duplicate)
- 413: Payload too large
- 500: Server error
- 503: Service unavailable (Claude API down)

---

## RATE LIMITS

Per authenticated user:
- 100 requests/minute (general)
- 10 file uploads/minute (images/audio)
- 5 transcription requests/minute (Claude API)
- 1 export request/minute (heavy operations)

Exceeded: Returns 429 Too Many Requests

---

## PAGINATION

Large result sets use cursor-based pagination:

```typescript
// First request
GET /api/memories?partner_id=xxx&limit=20

// Response
{
  data: Memory[],
  hasMore: true,
  cursor: "eyJjcmVhdGVkX2F0IjoiMjAyNi0wMy0yMCJ9"
}

// Next request
GET /api/memories?partner_id=xxx&limit=20&cursor=eyJjcmVhdGVkX2F0IjoiMjAyNi0wMy0yMCJ9

// Response (last page)
{
  data: Memory[],
  hasMore: false,
  cursor: null
}
```

---

## IMPLEMENTATION NOTES

- All endpoints require authentication (session check)
- All user_id validation via auth.uid()
- All timestamps in UTC ISO format
- All file paths are storage URLs (public or signed)
- RLS enforces data isolation at DB level
- Errors are user-friendly (no stack traces exposed)
