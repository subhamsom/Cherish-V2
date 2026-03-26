# Cherish V2 — Pre-Development Checklist & Best Practices

**Purpose:** Final checklist before development. Ensures solid foundation, minimal pivots, efficient Cursor-assisted coding.

---

## PART 1: MISSING CRITICAL DOCUMENTS

### ✅ 1. Database Schema Document (CRITICAL)

**Must Have Before Any Coding**

You need exact Supabase table structures, relationships, and indexes.

```
cherish_v2_database_schema.md should include:

1. TABLES
   ├─ users (id, email, name, avatar_url, created_at, updated_at)
   ├─ partners (id, user_id, name, photo_url, relationship_start_date, bio, created_at, updated_at)
   ├─ memories (id, user_id, partner_id, type, content, audio_url, image_url, tags, liked, pinned, archived, created_at)
   ├─ reminders (id, user_id, partner_id, type, title, date, reminder_time, category, price, completed, recurring, created_at)
   ├─ tags (id, user_id, name, color, created_at)
   └─ memory_tags (memory_id, tag_id) [junction table]

2. RELATIONSHIPS
   ├─ users ← → partners (one-to-many)
   ├─ users ← → memories (one-to-many)
   ├─ partners ← → memories (one-to-many)
   ├─ memories ← → tags (many-to-many via memory_tags)
   └─ users ← → reminders (one-to-many)

3. INDEXES
   ├─ memories.partner_id, created_at (for sorting/filtering)
   ├─ reminders.date (for upcoming calculations)
   ├─ memories.tags (for searching)
   └─ users.email (for auth)

4. ROW LEVEL SECURITY (RLS)
   ├─ Users can only see their own data
   ├─ Users can only see their own partner's data
   └─ No cross-user data leakage

5. STORAGE
   ├─ Audio files: /memories/{user_id}/{memory_id}/audio.wav
   ├─ Images: /memories/{user_id}/{memory_id}/image.jpg
   └─ Profile photos: /profiles/{user_id}/avatar.jpg
```

**Why Critical:** Without this, you'll build code that doesn't match DB, causing massive refactors.

---

### ✅ 2. API Endpoints Document (CRITICAL)

**Must Have Before Building Screens**

Exact REST API structure for all operations.

```
cherish_v2_api_endpoints.md should include:

MEMORIES
  POST   /api/memories              Create memory
  GET    /api/memories              List (filter, sort, paginate)
  GET    /api/memories/:id          Get single
  PUT    /api/memories/:id          Update
  DELETE /api/memories/:id          Delete
  POST   /api/memories/:id/like     Toggle like
  POST   /api/memories/:id/pin      Toggle pin
  POST   /api/memories/:id/archive  Toggle archive

VOICE NOTES
  POST   /api/voice/transcribe      Send audio → get transcription (Claude)
  POST   /api/voice/upload          Upload audio file to storage

PARTNERS
  POST   /api/partners              Create partner
  GET    /api/partners/:id          Get partner + stats
  PUT    /api/partners/:id          Update partner
  DELETE /api/partners/:id          Delete partner

REMINDERS
  POST   /api/reminders             Create reminder
  GET    /api/reminders             List (upcoming, gifts, occasions)
  PUT    /api/reminders/:id         Update
  DELETE /api/reminders/:id         Delete
  POST   /api/reminders/:id/complete Mark complete

INSIGHTS
  GET    /api/insights/partner/:id  Get insights (stats, charts, AI summary)

AUTH
  POST   /api/auth/signin           Google OAuth
  POST   /api/auth/logout           Clear session
  GET    /api/auth/me               Get current user

For EACH endpoint:
  ├─ Request body schema (TypeScript interface)
  ├─ Response schema (TypeScript interface)
  ├─ Error codes (400, 401, 404, 500)
  ├─ Pagination details (if applicable)
  └─ Rate limits (if applicable)
```

**Why Critical:** Frontend can't be built without knowing API contract.

---

### ✅ 3. TypeScript Types Document (CRITICAL)

**Must Have Before First Component**

All shared types, interfaces, and enums.

```
cherish_v2_types.md should include:

CORE TYPES
  ├─ User { id, email, name, avatar_url, preferences }
  ├─ Partner { id, user_id, name, photo_url, relationship_start_date, bio }
  ├─ Memory { id, type, content, audio_url, image_url, tags, liked, pinned, archived, created_at }
  ├─ Reminder { id, type, title, date, reminder_time, category, price, completed, recurring }
  └─ Tag { id, name, color }

ENUMS
  ├─ MemoryType = 'text' | 'voice' | 'photo' | 'gift' | 'occasion'
  ├─ ReminderType = 'gift' | 'occasion'
  ├─ MoodTag = 'happy' | 'romantic' | 'grateful' | ...
  └─ ReminderFrequency = 'never' | 'daily' | 'weekly' | 'random'

API RESPONSE TYPES
  ├─ ApiResponse<T> { success, data, error }
  ├─ PaginatedResponse<T> { data, hasMore, cursor }
  └─ ErrorResponse { code, message }

FORM TYPES
  ├─ CreateMemoryInput { content, type, tags, media? }
  ├─ CreateReminderInput { title, date, reminder_time, recurring }
  └─ UpdateUserPreferences { dark_mode, notifications_enabled, ... }

UI COMPONENT PROPS (from Design System)
  ├─ ButtonProps { variant, size, disabled, isLoading }
  ├─ MemoryCardProps { memory, onLike, onDelete, ... }
  └─ ModalProps { isOpen, onClose, title, children }
```

**Why Critical:** Typescript everywhere prevents runtime errors, improves IDE autocompletion.

---

### ✅ 4. Environment Variables Document

**Must Have for Local + Deployment**

```
cherish_v2_env_variables.md should include:

LOCAL DEVELOPMENT (.env.local)
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
  SUPABASE_SERVICE_KEY=xxx (backend only)
  NEXT_PUBLIC_ANTHROPIC_API_KEY=xxx
  ANTHROPIC_API_KEY=xxx (backend only)
  NEXT_PUBLIC_VERCEL_URL=http://localhost:3000

STAGING (.env.staging)
  NEXT_PUBLIC_SUPABASE_URL=https://staging-xxx.supabase.co
  [etc., different credentials]

PRODUCTION (.env.production)
  NEXT_PUBLIC_SUPABASE_URL=https://prod-xxx.supabase.co
  [etc., different credentials]

IMPORTANT
  ├─ Never commit .env.local
  ├─ NEXT_PUBLIC_* variables are exposed to browser (only non-sensitive)
  ├─ Backend secrets in regular env vars (Node.js only)
  └─ Use Vercel secrets for production
```

---

### ✅ 5. Git Strategy & Commit Rules Document

**Must Have for Clean History**

```
cherish_v2_git_strategy.md should include:

BRANCH NAMING
  ├─ main (production, protected)
  ├─ staging (staging, protected)
  ├─ dev (development, working branch)
  └─ feature/component-name (feature branches)

COMMIT FORMAT
  ├─ feat(memories): add voice note transcription
  ├─ fix(ui): correct button padding in dark mode
  ├─ refactor(components): simplify card styling
  ├─ docs: update design system colors
  ├─ test(memories): add useMemories hook tests
  └─ chore: upgrade tailwind to v4.1

PR PROCESS
  ├─ Create PR from feature/ → dev
  ├─ Request review (pair programming or async)
  ├─ All tests pass + design system check
  ├─ Squash merge to dev
  ├─ When sprint ends: dev → staging → main

.gitignore
  ├─ .env.local (never commit secrets)
  ├─ node_modules/
  ├─ .next/
  ├─ dist/
  └─ .DS_Store
```

---

### ✅ 6. Testing Strategy Document

**Must Have for Quality Assurance**

```
cherish_v2_testing_strategy.md should include:

UNIT TESTS (jest + React Testing Library)
  ├─ Components: Button, Card, Input, Modal, etc.
  ├─ Hooks: useMemories, useReminders, useAuth
  ├─ Utils: formatDate, slugify, parseMemoryType
  ├─ Goal: >80% coverage for critical paths

INTEGRATION TESTS
  ├─ User flow: Sign in → Create memory → View in feed
  ├─ API calls: Fetch memories → Display → Like → Refetch
  ├─ Forms: Validate → Submit → Success toast

COMPONENT TESTS (Storybook)
  ├─ Visual regression: All components in light + dark
  ├─ States: Default, hover, focus, active, disabled
  ├─ Responsive: 320px, 768px, 1440px

E2E TESTS (Playwright, optional for MVP)
  ├─ User signup → Create reminder → Get notification
  ├─ Mobile responsiveness checks
  ├─ Cross-browser: Chrome, Safari, Firefox

PERFORMANCE TESTS
  ├─ Lighthouse: 90+ score
  ├─ Core Web Vitals: LCP, FID, CLS
  ├─ Bundle size: <200KB (gzipped)

ACCESSIBILITY TESTS
  ├─ axe DevTools: No errors or violations
  ├─ Screen reader: VoiceOver on Mac, NVDA on Windows
  ├─ Keyboard nav: Tab through all screens
```

---

### ✅ 7. Deployment & DevOps Document

**Must Have for Production Readiness**

```
cherish_v2_deployment.md should include:

VERCEL DEPLOYMENT
  ├─ Connect repo → auto-deploy on main branch
  ├─ Environment variables: Set in Vercel dashboard
  ├─ Preview deployments: Auto on PRs
  ├─ Rollback: One click on Vercel

SUPABASE SETUP
  ├─ Create staging + production projects
  ├─ Database migrations: Use Supabase CLI
  ├─ Backups: Automated daily
  ├─ Monitoring: Check logs for errors

MONITORING & LOGGING
  ├─ Sentry: Error tracking + session replay
  ├─ LogRocket: User session replay (optional)
  ├─ Vercel Analytics: Performance metrics
  ├─ Supabase Logs: Check for failed queries

CI/CD PIPELINE
  ├─ GitHub Actions: Run tests on every PR
  ├─ Lint check: ESLint + Prettier
  ├─ Type check: TypeScript strict mode
  ├─ Build check: Next.js builds successfully

SECURITY
  ├─ HTTPS: Vercel auto-enabled
  ├─ RLS: Supabase row-level security configured
  ├─ Secrets: Never in repo, always in Vercel
  ├─ CORS: Configure for your domain only
```

---

## PART 2: BEST PRACTICES TO MINIMIZE ITERATIONS & PIVOTS

### 🎯 1. BUILD IN STRICT ORDER (No Skipping)

**Why:** Building out of order creates dependency hell.

**Strict Order:**

```
WEEK 1 (Setup & Foundation)
  Day 1-2: Supabase setup, database schema, RLS
  Day 3: Auth (Google OAuth) - test locally
  Day 4-5: Build Phase 1 components (Button, Card, Input, Chip) + Storybook

WEEK 2 (Core Functionality)
  Day 1-2: Build Phase 2 components (Modal, TabBar, Toast)
  Day 3-4: Build Phase 3 components (MemoryCard, QuickCapture, PersonHeader)
  Day 5: Integrate components → Home screen shell

WEEK 3 (Features)
  Day 1-2: Memory CRUD (Create, Read, Update, Delete)
  Day 3-4: Reminders CRUD + filtering
  Day 5: Voice transcription (Claude API)

WEEK 4 (Polish)
  Day 1-2: Dark mode, responsive testing
  Day 3: Accessibility audit, fix issues
  Day 4-5: Performance optimization, bug fixes

AFTER WEEK 4: Deploy to staging, user testing, iterate
```

**Rules:**
- ❌ Don't build screens before all components are tested
- ❌ Don't integrate API before components are done
- ❌ Don't add features before CRUD works
- ✅ Test each component in isolation (Storybook)
- ✅ Test each API endpoint before using in UI
- ✅ Build features in priority order (memories → reminders → voice)

---

### 🎯 2. API-FIRST DEVELOPMENT

**Why:** Frontend can't be built without knowing API contract. Cursor needs clear targets.

**How:**

```
Step 1: Write API types (TypeScript interfaces)
  // types/memory.ts
  export interface Memory {
    id: string
    user_id: string
    partner_id: string
    type: 'text' | 'voice' | 'photo' | 'gift' | 'occasion'
    content: string
    audio_url?: string
    image_url?: string
    tags: string[]
    liked: boolean
    pinned: boolean
    archived: boolean
    created_at: string
    updated_at: string
  }

Step 2: Mock API responses (before real backend)
  // lib/mock-data.ts
  export const mockMemories: Memory[] = [
    {
      id: '1',
      user_id: 'user-1',
      partner_id: 'partner-1',
      type: 'text',
      content: 'We had a great date at the coffee shop',
      tags: ['happy', 'date-night'],
      liked: true,
      created_at: '2024-03-20T10:00:00Z',
      // ...
    }
  ]

Step 3: Build custom hooks with mock data
  // hooks/useMemories.ts
  export function useMemories(partnerId: string) {
    const [memories, setMemories] = useState<Memory[]>(mockMemories)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    // Once real API ready, swap fetch call
    // For now, return mock data immediately
  }

Step 4: Build UI with mocked hooks
  // Components use real-looking data from day 1

Step 5: Replace mock API with real API
  // Swap fetch call, hooks stay same interface
  // UI doesn't change because contract was correct
```

**Key Benefit:** UI development never blocks on backend. Both can work in parallel if needed.

---

### 🎯 3. COMPONENT PROPS FINALIZATION BEFORE BUILD

**Why:** Changing component props mid-build causes refactoring cascade.

**Before Building Any Component:**

```
Define EXACT props interface:

// MemoryCard.tsx
interface MemoryCardProps {
  memory: Memory
  onLike: (memoryId: string) => void
  onDelete: (memoryId: string) => void
  onPin: (memoryId: string) => void
  onArchive: (memoryId: string) => void
  isLoading?: boolean
}

Write 3 Storybook stories FIRST:
  1. Default (text memory)
  2. Voice memory (with playback)
  3. Photo memory

Test all props variations in Storybook BEFORE integrating into screens.

Only then: Use in Home Dashboard, Person Profile, etc.
```

**Why:** Props changes after integration means updating everywhere.

---

### 🎯 4. DESIGN TOKEN USAGE (100% Tailwind v4.1)

**Why:** Hardcoded colors/spacing = design chaos.

**Rule: ZERO hardcoded values**

```
❌ WRONG
<button style={{ padding: '12px 16px', backgroundColor: '#FF6B6B' }}>

❌ WRONG
<button className="p-[12px] bg-[#FF6B6B]">

✅ RIGHT
<button className="p-4 bg-primary drop-shadow-lg drop-shadow-primary/40">
```

**Implementation:**
- All colors in tailwind.config.js
- All spacing in tailwind.config.js
- All typography in tailwind.config.js
- Use `cn()` utility for conditional classes
- NEVER use inline styles
- NEVER use arbitrary values `[#custom-color]`

**Audit:** Before each commit, grep for `style=` and `[#` to catch violations.

---

### 🎯 5. DARK MODE & RESPONSIVE FIRST

**Why:** Adding these later = massive refactoring.

**Rule: Test everything in both light + dark, at 3 breakpoints**

```
Build Process:
  Step 1: Build component light mode (320px mobile)
  Step 2: Add dark mode (test side-by-side)
  Step 3: Add 768px tablet responsiveness
  Step 4: Add 1440px desktop responsiveness
  
NEVER:
  ❌ Build light mode for all breakpoints, then add dark
  ❌ Build desktop first, then squeeze to mobile
  ❌ Skip dark mode "for MVP"

Tool: Use browser dev tools
  ├─ Chrome: Device emulation + prefer-color-scheme
  ├─ Safari: Develop → Enter responsive design mode + Light/Dark toggle
```

---

### 🎯 6. ACCESSIBILITY TESTING INLINE

**Why:** Fixing a11y at the end is 10x harder.

**Rule: Test axe DevTools on every component**

```
For EACH component in Storybook:
  1. Open axe DevTools
  2. Run scan
  3. Must have 0 violations
  4. Color contrast >4.5:1
  5. All interactive elements keyboard accessible
  6. ARIA labels present

Tools:
  ├─ axe DevTools (Chrome extension)
  ├─ WAVE (Firefox extension)
  ├─ Screen reader (VoiceOver on Mac)
  └─ Keyboard nav (Tab through every component)
```

---

### 🎯 7. SCHEMA VERSIONING & MIGRATIONS

**Why:** Changing DB schema mid-development breaks everything.

**Rule: Never manually edit Supabase tables. Use migrations.**

```
Installation:
  npm install -g supabase

Workflow:
  1. Design schema before coding (done ✅)
  2. Create migration:
     supabase migration new create_memories_table
  3. Edit migration file (SQL):
     migrations/timestamp_create_memories_table.sql
     
  CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    partner_id UUID NOT NULL REFERENCES partners(id),
    type TEXT NOT NULL CHECK (type IN ('text', 'voice', 'photo', 'gift', 'occasion')),
    content TEXT NOT NULL,
    audio_url TEXT,
    image_url TEXT,
    tags TEXT[],
    liked BOOLEAN DEFAULT FALSE,
    pinned BOOLEAN DEFAULT FALSE,
    archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
  );
  
  4. Run migration:
     supabase db push
  
  5. Generate types:
     supabase gen types typescript > types/database.ts
```

**Why:** Migrations are version-controlled, reproducible, safe to rollback.

---

### 🎯 8. ERROR HANDLING ARCHITECTURE

**Why:** Inconsistent error handling = poor UX, hard debugging.

**Rule: Standardize error handling across app**

```
Create error handling layer:
  // lib/errors.ts
  
  export class AppError extends Error {
    constructor(
      public code: string,
      public message: string,
      public statusCode: number = 500,
      public context?: Record<string, any>
    ) {
      super(message)
    }
  }

  export const errors = {
    AUTH_REQUIRED: () => new AppError('AUTH_REQUIRED', 'Please sign in', 401),
    MEMORY_NOT_FOUND: (id: string) => new AppError('MEMORY_NOT_FOUND', `Memory ${id} not found`, 404),
    INVALID_INPUT: (field: string) => new AppError('INVALID_INPUT', `${field} is required`, 400),
    SERVER_ERROR: (context?: any) => new AppError('SERVER_ERROR', 'Something went wrong', 500, context),
  }

Use consistently:
  // hooks/useMemories.ts
  try {
    const data = await fetchMemories(partnerId)
    setMemories(data)
  } catch (err) {
    const appError = err instanceof AppError ? err : errors.SERVER_ERROR({ original: err })
    setError(appError.message)
    console.error(appError.code, appError.context)
    toast.error(appError.message)
  }

UI shows user-friendly message, logging captures details.
```

---

### 🎯 9. DATA FETCHING STRATEGY

**Why:** Unoptimized fetching = poor performance + N+1 queries.

**Rule: Use custom hooks, never raw fetch in components**

```
Pattern:
  // hooks/useMemories.ts
  export function useMemories(partnerId: string) {
    const [memories, setMemories] = useState<Memory[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [cursor, setCursor] = useState<string | null>(null)

    const fetchMemories = useCallback(async (nextCursor?: string) => {
      try {
        setLoading(true)
        const { data, hasMore: moreData, cursor: nextCursor } = 
          await api.memories.list({ partnerId, cursor: nextCursor })
        
        setMemories(prev => nextCursor ? [...prev, ...data] : data)
        setHasMore(moreData)
        setCursor(nextCursor)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }, [partnerId])

    useEffect(() => {
      fetchMemories()
    }, [fetchMemories])

    return { memories, loading, error, hasMore, loadMore: () => fetchMemories(cursor) }
  }

Use in component:
  // pages/home.tsx
  const { memories, loading, hasMore, loadMore } = useMemories(partnerId)
  
  NEVER: const [memories, setMemories] = useState([])
         useEffect(() => { fetch(...).then(setMemories) }, [])
```

**Why:** Centralizes logic, easier to refactor, reusable, testable.

---

### 🎯 10. IMAGE & MEDIA HANDLING

**Why:** Unoptimized media = slow app, poor mobile UX.

**Rules:**

```
Images:
  ✅ Use next/image (auto-optimize, lazy-load)
  ✅ Responsive sizes attribute: sizes="(max-width: 640px) 100vw, 50vw"
  ✅ Placeholder: placeholder="blur" or placeholder="empty"
  ✅ Quality: quality={75} for memory photos, quality={85} for profiles

Audio:
  ✅ Compress to .mp3 (not .wav) - 90kbps quality
  ✅ Client-side compression before upload (TensorFlow.js or native Web Audio)
  ✅ Stream from storage (don't load full file into memory)

Video (future):
  ✅ Don't add in MVP, too complex

Uploads:
  ✅ Validate file size: <10MB for audio, <20MB for images
  ✅ Validate MIME type: only audio/mpeg, image/jpeg, image/png
  ✅ Show progress: visual feedback while uploading
  ✅ Handle failures: retry logic, error message
```

---

## PART 3: PRE-CODING CHECKLIST

**Before You Start Writing ANY Code:**

### Infrastructure
- [ ] Supabase project created (dev + staging + prod)
- [ ] Database schema designed & reviewed (in DB schema doc)
- [ ] RLS (Row Level Security) policies configured
- [ ] Auth (Google OAuth) configured in Supabase
- [ ] Storage buckets created (memories, profiles)

### Development Setup
- [ ] Node.js v18+ installed
- [ ] Next.js project initialized with TypeScript + Tailwind v4.1
- [ ] shadcn/ui initialized
- [ ] Storybook initialized
- [ ] Git repo initialized, .gitignore configured
- [ ] Environment variables set up (.env.local)

### Documentation
- [ ] Database schema doc completed
- [ ] API endpoints doc completed
- [ ] TypeScript types doc completed
- [ ] Design system finalized (colors, spacing, typography, components)
- [ ] Cursor rules file created (.cursorrules)
- [ ] Git strategy documented

### Tools & Extensions
- [ ] ESLint + Prettier configured
- [ ] axe DevTools installed (Chrome/Firefox)
- [ ] TypeScript set to strict mode
- [ ] GitHub Actions (optional, for CI/CD)

### Architecture
- [ ] lib/errors.ts (error handling)
- [ ] lib/utils.ts (cn(), helpers)
- [ ] lib/supabase.ts (Supabase client)
- [ ] types/ folder structure planned
- [ ] hooks/ folder structure planned
- [ ] components/ folder structure planned

### Testing
- [ ] Jest configured
- [ ] React Testing Library configured
- [ ] Storybook configured for all components
- [ ] Test naming conventions decided

---

## PART 4: FIRST WEEK EXECUTION PLAN

**Day 1-2: Infrastructure & Setup**
```
Morning:
  - Supabase projects (dev/staging/prod)
  - Database schema deployed
  - RLS policies configured
  - Google OAuth setup

Afternoon:
  - Next.js project initialized
  - Tailwind + shadcn/ui + Storybook setup
  - ESLint + Prettier configured
  - TypeScript strict mode enabled
  - .env.local configured

End of Day: `npm run dev` works, Storybook works
```

**Day 3: Auth Foundation**
```
Morning:
  - lib/supabase.ts (client)
  - Google OAuth flow in app/auth/signin
  - Session persistence (useAuth hook)

Afternoon:
  - Test OAuth locally (sign in → sign out)
  - Protect routes (middleware)
  - Redirect to onboarding for new users

End of Day: Full auth flow works, user can sign in/out
```

**Day 4-5: Phase 1 Components**
```
Day 4:
  - Button component (all variants)
  - Card component (base + interactive)
  - Button + Card stories in Storybook
  - axe test both (0 violations)

Day 5:
  - Input component (text + textarea)
  - Chip component
  - All stories in Storybook
  - Dark mode test for all 4 components

End of Week: 4 solid, tested, production-ready components
```

---

## PART 5: CURSOR PROMPTING BEST PRACTICES

**How to Ask Cursor for Code (Minimal Iterations)**

### ✅ GOOD PROMPTS

```
"Build the Button component with:
- Props: variant ('primary'|'secondary'|'ghost'), size ('sm'|'md'|'lg'), disabled, isLoading, className
- Use Tailwind v4.1 (text-shadow, drop-shadow-<color> for primary)
- Gradient background (primary → secondary, 135°)
- TypeScript interfaces for props
- Keyboard accessible (focus ring visible)
- Dark mode support (test with prefers-color-scheme)
- Storybook story with 5 variants (primary, secondary, ghost, disabled, loading)

Reference: DESIGN_SYSTEM.md Button section, CURSOR_RULES.md Button patterns

Expected outcome: Fully tested, accessible, dark-mode component ready for Storybook"
```

### ❌ BAD PROMPTS

```
"Make a button component" (too vague, needs iteration)
"Build all screens" (too big, will fail)
"Use whatever you think looks good" (no design spec)
```

---

## SUMMARY: MUST-HAVES BEFORE CODING

| Category | Must Have | Status |
|----------|-----------|--------|
| **Database** | Schema doc + Supabase setup | Create |
| **API** | Endpoints doc + Types doc | Create |
| **Types** | Shared TypeScript interfaces | Create |
| **Environment** | .env setup + credentials | Create |
| **Git** | Branch strategy + commit format | Create |
| **Testing** | Jest/RTL/Storybook config | Create |
| **Deployment** | Vercel + DevOps doc | Create |
| **Architecture** | Error handling, data fetching patterns | Create |
| **Design** | System finalized (components, tokens) | ✅ Done |
| **Cursor Rules** | Code standards + v4.1 patterns | ✅ Done |
| **Documentation** | All docs above | Create |

---

**Create these 3 docs before Week 1:**

1. **CHERISH_V2_DATABASE_SCHEMA.md** — Exact table structures, relationships, RLS
2. **CHERISH_V2_API_ENDPOINTS.md** — All endpoints, request/response types
3. **CHERISH_V2_SETUP_GUIDE.md** — How to set up dev environment locally

**Then you're ready for Cursor + development.** ✅
