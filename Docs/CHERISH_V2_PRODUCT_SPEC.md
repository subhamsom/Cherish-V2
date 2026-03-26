# Cherish V2 — Complete Product Specification

**Status:** Ready for Design & Development  
**Platform:** Mobile-first PWA (Next.js), Desktop responsive  
**Last Updated:** March 2026  
**Owner:** Subham

---

## TABLE OF CONTENTS

1. [Product Overview](#product-overview)
2. [Core Features & Entry Types](#core-features--entry-types)
3. [Complete User Flows](#complete-user-flows)
4. [Screen-by-Screen Interaction Map](#screen-by-screen-interaction-map)
5. [State Management](#state-management)
6. [Navigation Architecture](#navigation-architecture)
7. [Edge Cases & Error Handling](#edge-cases--error-handling)
8. [Key Design Decisions](#key-design-decisions)
9. [Implementation Priorities](#implementation-priorities)

---

## PRODUCT OVERVIEW

### Vision
A relationship memory companion app for romantic partners that captures, organizes, and celebrates intimate moments through text, voice, photos, and reminders.

### Target User
Someone in a romantic relationship who wants to remember and cherish special moments with their partner.

### Platform & Stack
- **Platform:** Mobile-first PWA (Next.js App Router)
- **Responsive:** Works on mobile, desktop, with Capacitor-ready for App Store later
- **Tech Stack:** Next.js (App Router) + Supabase + Vercel + Tailwind CSS + shadcn/ui + Resend + Anthropic Claude API
- **Styling:** Tailwind CSS for design tokens, shadcn/ui for accessible component library
- **Auth:** Google OAuth only (simple, trusted)

### Design Language
- **Feel:** Playful, expressive, colorful, emotional
- **Colors:** Rose & Cream palette
  - Primary/Coral: #FF6B6B
  - Secondary/Peach: #FFB4A2
  - Background/Cream: #FFF0EC
  - Text/Dark: #2D1B1B
- **Typography:** Playfair Display (headings) + Plus Jakarta Sans (body)
- **Components:** Glassmorphism with subtle micro-interactions
- **Modes:** Light (default) + dark mode toggle
- **Tone:** Warm, inclusive, modern — "partner" not "boyfriend/girlfriend", language works for all orientations

---

## CORE FEATURES & ENTRY TYPES

### 1. Text Notes
Quick thoughts, conversations, observations, full memories.

### 2. Voice Notes
Record moments, auto-transcribed by Claude API. Can edit transcription.

### 3. Photo Attachments
Capture visual moments, upload with optional captions.

### 4. Gift Ideas
Undated inspiration for gifts — browse when planning occasions. No date required initially.
- Store gift name, category, price
- Link to memories if conversation-based
- Browse in Reminders → Gifts tab
- Reference when occasion approaches

### 5. Mood/Vibe Tags
Semantic labels for discovery & insights:
- Predefined: #Happy, #Romantic, #Grateful, #Funny, #Thoughtful, #Adventure, #Intimate, #Quiet-moment, etc.
- Custom tags allowed
- Max 5 tags per memory
- Enable filtering, search, and insights

### 6. Occasion Reminders
Date-tied reminders for birthdays, anniversaries, custom occasions.
- Date picker (required)
- Recurring toggle (annual or one-time)
- Reminder timing: 1 day, 3 days, 1 week, 2 weeks, or custom
- Custom notification time per reminder (optional override)
- Linked to gifting ideas list

---

## COMPLETE USER FLOWS

### FLOW 1: First-Time User (Onboarding)

```
App Load
  ↓
Check Auth Status → Not Authenticated
  ↓
Landing Screen
  ├─ Hero image/animation
  ├─ Tagline: "Remember what matters"
  └─ [Sign In with Google] button
      ↓
      Google OAuth flow
      ↓
      Onboarding (New User Detected)
      ↓
      
SCREEN 1/3: Welcome
  ├─ Title: "Welcome to Cherish"
  ├─ Subtitle: "Cherish memories with your person"
  ├─ Illustration: Loving couple
  └─ [Get Started] → Screen 2
      ↓

SCREEN 2/3: Add Your Person
  ├─ Text field: "Partner's name" (required)
  ├─ Photo picker: "Add their photo" (optional)
  ├─ Date picker: "Relationship start date" (optional)
  └─ [Continue] → Screen 3
      ↓

SCREEN 3/3: Preferences
  ├─ Dark mode: Toggle
  ├─ Notifications: Toggle + Frequency (Never/Daily/Weekly/Random)
  ├─ Reminder lead time: Dropdown (1 day, 3 days, 1 week, 2 weeks)
  └─ [Start Cherishing] → Home Dashboard
      ↓
      
Home Dashboard Loads (Empty state with CTA)
```

### FLOW 2: Returning User Auth

```
App Load
  ↓
Check Auth Status → Authenticated
  ↓
Fetch profile, partner, memories, reminders (parallel)
  ↓
Home Dashboard renders with data
```

### FLOW 3: Adding a Memory (Core Action)

#### Path A: Quick Capture Modal (FAB or Tab)

```
User taps [+] FAB (right side, above tab bar) OR "New Entry" in tab bar
  ↓
Quick Capture Modal Opens
  ├─ Header: "Add a Memory"
  ├─ Dismiss: [X] button (saves draft to localStorage)
  │
  ├─ TAB 1: TEXT NOTE (Default)
  │   ├─ Textarea: "What happened?" (placeholder)
  │   ├─ Auto-expand on focus
  │   ├─ Tag section:
  │   │   ├─ "Add tags..." (tappable)
  │   │   ├─ Tap opens tag picker modal
  │   │   ├─ Predefined: Happy, Romantic, Grateful, etc.
  │   │   ├─ Custom: Can create new tags
  │   │   ├─ Selected tags show as chips
  │   │   └─ Max 5 tags
  │   ├─ Media: [+ Photo] button
  │   │   └─ Opens camera/gallery picker
  │   │   └─ Photo preview on selection
  │   └─ [Save Memory] button (validates content not empty)
  │
  ├─ TAB 2: VOICE NOTE
  │   ├─ [● Record] button (pulsing when recording)
  │   ├─ Timer: Shows elapsed time
  │   ├─ [Stop] button (when recording)
  │   ├─ Playback: Auto-preview after recording
  │   ├─ Transcription: "Transcribing..." → Display text
  │   ├─ Edit: User can edit transcribed text
  │   ├─ Tags section (same as Tab 1)
  │   └─ [Save Memory] button
  │
  ├─ TAB 3: PHOTO ONLY
  │   ├─ [Camera/Gallery] picker button
  │   ├─ Photo preview
  │   ├─ Caption textarea (optional)
  │   ├─ Tags section (same as Tab 1)
  │   └─ [Save Memory] button
  │
  ├─ TAB 4: GIFT IDEA (Undated)
  │   ├─ Text field: "Gift name" (required)
  │   ├─ Dropdown: Category (Jewelry, Experience, Book, Tech, Clothing, etc.)
  │   ├─ Price field (optional, for budgeting)
  │   ├─ Notes: Where you found it, why they'd love it
  │   ├─ Link picker (optional): URL to product
  │   └─ [Save Gift Idea] button
  │
  └─ TAB 5: OCCASION REMINDER (Date-tied)
      ├─ Text field: "Occasion name" (Birthday, Anniversary, etc.)
      ├─ Date picker: "When is it?" (required)
      ├─ Recurring: Toggle for "Repeat annually"
      ├─ Reminder timing: Dropdown
      │   ├─ 1 day before
      │   ├─ 3 days before
      │   ├─ 1 week before
      │   ├─ 2 weeks before
      │   └─ Custom: [Pick date & time] (optional)
      ├─ (If custom selected) Time picker: "Notify me at..."
      └─ [Save Reminder] button

On [Save Memory/Gift/Reminder]:
  ├─ Validation: Required fields filled
  ├─ Create object: { id, type, content, tags, media, created_at }
  ├─ API: POST /api/memories or POST /api/reminders
  ├─ Toast: "Memory saved! 💕"
  ├─ Modal closes
  ├─ localStorage draft cleared
  └─ Home Dashboard: Memory appears at top of feed
```

#### Path B: Draft Saving & Resumption

```
User opens Quick Capture, types content
  ↓
App auto-saves to localStorage every 30 seconds
  └─ Stores: { type, content, tags, audioBlob?, imageFile?, timestamp }

User closes app/tab before saving
  ↓
Draft persists in localStorage (no permissions needed)

User returns to app
  ↓
App checks localStorage on load
  ↓
Draft banner appears (top of screen):
  ┌────────────────────────────────────┐
  │ 📝 You have a draft                │
  │ "We had an amazing dinner tonig..." │
  │ [Continue] [Discard]               │
  └────────────────────────────────────┘

[Continue] tapped:
  ├─ Quick Capture modal opens
  ├─ All content, tags, media pre-populated
  ├─ Cursor focuses on main field
  └─ User finishes and saves

[Discard] tapped:
  ├─ localStorage draft cleared
  └─ User starts fresh
```

### FLOW 4: Viewing & Managing Memories

#### Path A: Home Dashboard (Memory Feed)

```
Home Dashboard
  ├─ Header: "Cherish" + Partner avatar
  │
  ├─ Filter/Sort Bar:
  │   ├─ Dropdown: Sort by (Newest, Oldest, Random, Mood)
  │   ├─ Tag chips: Filter by type (Text, Voice, Photo, Gift, Occasion)
  │   └─ Search icon: Open search modal
  │
  ├─ Memory Feed (Infinite scroll with cursor-based pagination):
  │   ├─ CARD 1: Text Memory (Glassmorphism)
  │   │   ├─ Partner avatar + name + "5 days ago"
  │   │   ├─ Content preview (first 150 chars)
  │   │   ├─ Tags as chips
  │   │   ├─ Media thumbnail (if photo)
  │   │   ├─ Actions (revealed on hover or swipe left):
  │   │   │   ├─ [❤️ Like] — Fills heart, increments count
  │   │   │   ├─ [👁️ View Full]
  │   │   │   └─ [⋮ More] → Menu
  │   │   │       ├─ [Edit]
  │   │   │       ├─ [Share]
  │   │   │       ├─ [Pin to Top] (📌)
  │   │   │       ├─ [Archive]
  │   │   │       └─ [Delete] (with confirmation)
  │   │   │
  │   │   └─ Swipe interactions (mobile):
  │   │       ├─ Swipe left: Reveal [Pin] [Archive] [Delete]
  │   │       └─ Swipe right: Go back (if in detail)
  │   │
  │   ├─ CARD 2: Voice Memory
  │   │   ├─ [▶️ Play] button (audio player inline)
  │   │   ├─ Duration: "2:35"
  │   │   ├─ Transcription preview
  │   │   ├─ Same actions as Card 1
  │   │
  │   ├─ CARD 3: Photo Memory
  │   │   ├─ Full photo preview (optimized for mobile)
  │   │   ├─ Caption (if added)
  │   │   ├─ Same actions as Card 1
  │   │
  │   └─ CARD 4: Gift/Occasion
  │       ├─ Icon (🎁 or 📅)
  │       ├─ Title + date
  │       ├─ Status badge: "Due in 5 days" or "🎉 Today!"
  │       ├─ Same actions as Card 1
  │
  ├─ Empty State (No memories):
  │   ├─ Illustration: Happy couple
  │   ├─ "No memories yet"
  │   └─ [Add Your First Memory] → Quick Capture
  │
  └─ Loading State:
      ├─ Skeleton cards (3-4 placeholders)
      └─ Pulse animation
```

#### Path B: Memory Detail View

```
User taps [👁️ View Full] or card
  ↓
Memory Detail Screen
  ├─ Header:
  │   ├─ [← Back] button (tap or swipe right)
  │   ├─ Title: Memory type
  │   └─ [⋮ More] menu (Edit, Share, Pin, Archive, Delete)
  │
  ├─ Content Area:
  │   ├─ Partner: Avatar + name + date
  │   ├─ Full content: Complete text/transcription
  │   ├─ Media: Full-size image or audio player
  │   ├─ Tags: All tags displayed
  │   │
  │   ├─ Related Memories Section (Bottom):
  │   │   ├─ "You also said..." (same tag)
  │   │   ├─ 2-3 related memory cards
  │   │   └─ [See All Similar] → Filtered feed
  │
  └─ Actions (Sticky Footer):
      ├─ [❤️ Like] button
      └─ [Share] button → Share modal
```

#### Path C: Search & Filter

```
User taps search icon
  ↓
Search Bar expands or modal opens
  ├─ Input: "Search memories..."
  ├─ As user types:
  │   ├─ Recent searches
  │   ├─ Popular tags
  │   └─ Matching memory previews
  │
  └─ Results:
      ├─ Grouped by date / tag / type
      ├─ Memory cards (same as feed)
      └─ [Clear Search] button
```

### FLOW 5: Person Profile & Insights

#### Path A: Person Profile Screen

```
User taps 👤 Person tab
  ↓
Person Profile Screen
  ├─ HEADER SECTION:
  │   ├─ Hero photo (large, or placeholder)
  │   ├─ Name: Prominent heading
  │   ├─ Relationship duration: "Together 2 years 3 months"
  │   └─ [✏️ Edit Partner] button
  │
  ├─ STATS GRID:
  │   ├─ Total memories: "47"
  │   ├─ Favorite type: "Text notes (59%)"
  │   ├─ Most common mood: "Happy 😊"
  │   └─ Last memory: "5 days ago"
  │
  ├─ VIEW TOGGLE (Mobile: tabs, Desktop: buttons):
  │   ├─ [Timeline] (default)
  │   ├─ [Gallery]
  │   └─ [Moods]
  │
  ├─ TIMELINE VIEW:
  │   ├─ Vertical timeline by month
  │   ├─ "March 2026" header
  │   ├─ Memory cards in chronological order
  │   ├─ Month jump: Tap month to scroll
  │   └─ Infinite scroll
  │
  ├─ GALLERY VIEW:
  │   ├─ Grid of photo memories only
  │   ├─ Tap to expand lightbox
  │   └─ Swipe left/right in lightbox
  │
  ├─ MOODS VIEW:
  │   ├─ Pie chart: Happy, Romantic, Grateful, etc.
  │   ├─ Percentages
  │   ├─ Tap mood → Filter memories by that mood
  │   └─ Mood trend over time (line chart)
  │
  ├─ QUICK ACTIONS (Sticky footer or header):
  │   ├─ [+ Add Memory]
  │   └─ [View Insights] (separate screen)
  │
  ├─ ACCOUNT SECTION (Collapsible):
  │   ├─ [⚙️ Appearance]
  │   │   ├─ Dark mode toggle
  │   │   └─ Font size slider
  │   │
  │   ├─ [⚙️ Notifications]
  │   │   ├─ Enable toggle
  │   │   ├─ Global frequency: Never / Daily / Weekly / Random
  │   │   ├─ Global notification time: Time picker (for daily prompts)
  │   │   └─ [Test Notification] button
  │   │
  │   ├─ [⚙️ Privacy & Data]
  │   │   ├─ [Export My Data] (CSV/JSON)
  │   │   ├─ [Download Copy] (All memories as PDF)
  │   │   └─ [Clear Cache]
  │   │
  │   ├─ [⚙️ Help & Support]
  │   │   ├─ [About Cherish]
  │   │   ├─ [Tutorial]
  │   │   ├─ [FAQ]
  │   │   ├─ [Contact Support]
  │   │   └─ [Privacy Policy]
  │   │
  │   └─ [⚙️ Account]
  │       ├─ Email display
  │       ├─ [Logout] button (with confirmation modal)
  │       └─ [Delete Account] button (heavy confirmation, requires "DELETE" text input)
```

#### Path B: Edit Partner Profile

```
User taps [✏️ Edit Partner]
  ↓
Edit Partner Modal
  ├─ Photo picker: [Change Photo]
  ├─ Name field (editable text)
  ├─ Relationship start date (date picker)
  ├─ Bio/Notes field (textarea, optional)
  ├─ [Save Changes] button
  └─ [Delete Partner] button (bottom, with heavy confirmation)
      └─ "This will delete all memories with this partner"
```

#### Path C: Relationship Insights

```
User taps [View Insights]
  ↓
Insights Dashboard
  ├─ STATS CARDS (Top):
  │   ├─ "47 memories together"
  │   ├─ "12-day streak" (days with at least 1 memory)
  │   ├─ "Last memory: 5 days ago"
  │   └─ "Most active month: March (8 memories)"
  │
  ├─ MOOD BREAKDOWN (Pie chart):
  │   ├─ Happy: 40%
  │   ├─ Romantic: 25%
  │   ├─ Grateful: 20%
  │   └─ Other: 15%
  │   └─ Tap mood → Filter to memories with that mood
  │
  ├─ ACTIVITY TIMELINE (Bar chart):
  │   ├─ Last 12 weeks on X-axis
  │   ├─ Memories per week on Y-axis
  │   └─ Tap bar → Show memories for that week
  │
  ├─ MEMORY TYPE BREAKDOWN:
  │   ├─ Text: 28 (59%)
  │   ├─ Voice: 12 (26%)
  │   ├─ Photos: 5 (11%)
  │   └─ Gifts/Occasions: 2 (4%)
  │
  ├─ INSIGHTS SECTION (Rule-based, no AI in Phase 1):
  │   ├─ IF streak > 7: "🔥 12-day streak! Keep it going"
  │   ├─ IF no memory in 3 days: "Psst... haven't captured a moment in 3 days"
  │   ├─ IF date approaching: "Birthday in 5 days! Check gift ideas"
  │   ├─ IF mood trending up: "Lots of happy moments lately! 😊"
  │   └─ IF memory type skewed: "All text notes. Try voice sometime!"
  │
  └─ ACTIONS (Bottom):
      ├─ [Export as PDF] → Download memories
      └─ [Generate Annual Report] → Anniversary summary
```

### FLOW 6: Reminders & Occasions

#### Path A: Reminders Dashboard

```
User taps 🔔 Reminders tab
  ↓
Reminders Dashboard
  ├─ Header: "Reminders & Occasions"
  │
  ├─ VIEW TOGGLE:
  │   ├─ [List] (default, with sub-tabs)
  │   └─ [Calendar] (new view)
  │
  ├─ LIST VIEW (Default):
  │   ├─ Sub-tabs:
  │   │   ├─ [Upcoming] — All upcoming occasions (sorted by date)
  │   │   ├─ [Gifts] — All gift ideas + upcoming gift occasions
  │   │   └─ [Occasions] — Birthdays, anniversaries, custom occasions
  │   │
  │   ├─ Sections:
  │   │   ├─ 🎉 Today
  │   │   │   ├─ Birthday: Olivia's birthday
  │   │   │   └─ [Mark Done] [Edit] [Snooze]
  │   │   │
  │   │   ├─ This Week
  │   │   │   ├─ Anniversary: 3 days away
  │   │   │   └─ Actions...
  │   │   │
  │   │   └─ Later
  │   │       ├─ Birthday: 5/10 (30 days away)
  │   │       └─ Actions...
  │   │
  │   ├─ REMINDER CARD (Generic):
  │   │   ├─ Icon: 🎂 (birthday), 💕 (anniversary), 🎁 (gift), 📅 (custom)
  │   │   ├─ Title: "Occasion name"
  │   │   ├─ Date: "March 30 (in 6 days)" or "🎉 Today!"
  │   │   ├─ Status badge:
  │   │   │   ├─ 🔔 Upcoming
  │   │   │   ├─ 🎉 Today
  │   │   │   ├─ ✓ Completed
  │   │   │   └─ 📌 Recurring
  │   │   ├─ Actions:
  │   │   │   ├─ [Edit] → Open edit modal
  │   │   │   ├─ [Mark Done] (if today or past)
  │   │   │   ├─ [Snooze ▼] → Menu (1 day, 1 week, custom)
  │   │   │   └─ [Delete]
  │   │   │
  │   │   └─ GIFT CARD specifics:
  │   │       ├─ Price: "$50" (if added)
  │   │       ├─ Category badge: "Jewelry"
  │   │       └─ Link to related memory (if exists)
  │
  ├─ CALENDAR VIEW (Toggle):
  │   ├─ Month calendar grid
  │   ├─ Days with reminders highlighted:
  │   │   ├─ Today: Blue circle
  │   │   ├─ Upcoming: Pink/coral dot or number badge
  │   │   ├─ Multiple: Number (e.g., "3")
  │   │   └─ Past/completed: Green checkmark
  │   │
  │   ├─ Interaction:
  │   │   ├─ Tap day → Show reminders for that day (below calendar)
  │   │   ├─ Swipe left/right → Navigate months
  │   │   ├─ [Today] button → Jump to current date
  │   │   └─ Long press day → Quick actions menu
  │   │
  │   └─ Details Section (Below calendar):
  │       ├─ Selected date: "March 30"
  │       ├─ Reminders for that day:
  │       │   ├─ Birthday (🎂)
  │       │   ├─ [Edit] [Mark Done] [Snooze]
  │       │   └─ ...
  │       └─ [+ Add Reminder] for that date
  │
  ├─ Empty State:
  │   ├─ "No reminders set"
  │   └─ [Add Occasion] [Add Gift] buttons
  │
  └─ FAB (Right side):
      └─ [+] → Open Quick Capture (Tab 5: Occasion Reminder)
```

#### Path B: Notification (System)

```
Reminder trigger time arrives (e.g., 1 week before birthday)
  ↓
Desktop / Push notification (if enabled in settings)
  ├─ Title: "Cherish: Birthday in 7 days!"
  ├─ Body: "Olivia's birthday is March 30"
  ├─ Action: [View] → Opens Reminders tab
  └─ Dismiss: [×]

Notification also available in-app:
  ├─ Toast banner (top or bottom)
  ├─ Auto-dismiss after 5 seconds
  └─ Tap to navigate to Reminders
```

---

## SCREEN-BY-SCREEN INTERACTION MAP

### Screen 1: Home Dashboard

| Element | Action | Result |
|---------|--------|--------|
| [+] FAB | Tap | Open Quick Capture Modal |
| Memory card | Tap | Open Memory Detail |
| [❤️] | Tap | Like/Unlike (heart fills, count updates) |
| [⋮] | Tap | Open context menu |
| Swipe left | Gesture | Reveal actions (Pin, Archive, Delete) |
| Swipe right | Gesture | Go back (if in detail) |
| Long press | Gesture | Open context menu (haptic feedback) |
| Filter chip | Tap | Filter feed by tag |
| Sort dropdown | Select | Re-sort feed |
| Search icon | Tap | Open search modal |
| Partner avatar (header) | Tap | Navigate to Person tab |

### Screen 2: Quick Capture Modal

| Element | Action | Result |
|---------|--------|--------|
| Tab buttons | Tap | Switch between Text/Voice/Photo/Gift/Occasion |
| Textarea | Tap | Expand, show keyboard |
| Record [●] | Tap | Start recording, show timer |
| [Stop] | Tap | Stop recording, show playback |
| [Photo] button | Tap | Open camera/gallery |
| Tag section | Tap | Open tag picker modal |
| [Save Memory] | Tap | Validate, save, close, show toast |
| [X] | Tap | Close modal, save draft to localStorage |
| Swipe down | Gesture | Close modal (mobile) |

### Screen 3: Memory Detail

| Element | Action | Result |
|---------|--------|--------|
| [← Back] | Tap | Close detail, return to feed |
| Swipe right | Gesture | Go back (alternative) |
| [⋮ More] | Tap | Open menu |
| [Edit] | Tap | Open Quick Capture in edit mode |
| [Share] | Tap | Open share modal |
| [Pin] / [Archive] / [Delete] | Tap | Execute action |
| [❤️] | Tap | Toggle like |
| Related card | Tap | Navigate to related memory |
| [▶️] (audio) | Tap | Play/pause |

### Screen 4: Person Profile

| Element | Action | Result |
|---------|--------|--------|
| [✏️ Edit] | Tap | Open edit partner modal |
| Timeline/Gallery/Moods | Tap | Switch view |
| Memory card | Tap | Navigate to Memory Detail |
| [+ Add Memory] | Tap | Open Quick Capture |
| [View Insights] | Tap | Navigate to Insights screen |
| [⋮ More] | Tap | Open menu |
| Appearance section | Tap | Expand settings |
| Dark mode toggle | Toggle | Change theme (real-time) |
| Notification settings | Adjust | Save immediately to database |

### Screen 5: Reminders Dashboard

| Element | Action | Result |
|---------|--------|--------|
| [List] / [Calendar] | Tap | Switch view |
| [Upcoming] / [Gifts] / [Occasions] | Tap | Switch category |
| Reminder card | Tap | Open edit reminder modal |
| [Edit] | Tap | Edit reminder |
| [Mark Done] | Tap | Complete reminder, show checkmark |
| [Snooze] | Tap | Open snooze menu (1d, 1w, custom) |
| [Delete] | Tap | Show confirmation, delete |
| Calendar day | Tap | Show reminders for that day |
| [Today] button | Tap | Jump to current date |
| [+] FAB | Tap | Open Quick Capture (Tab 5) |

### Screen 6: Insights Dashboard

| Element | Action | Result |
|---------|--------|--------|
| Mood pie chart | Tap mood | Filter to memories with that mood |
| Activity bar | Tap bar | Show memories for that week |
| Insight card | Tap | Navigate to related memory or feature |
| [Export as PDF] | Tap | Generate & download PDF |
| [Generate Annual Report] | Tap | Build anniversary report |

---

## STATE MANAGEMENT

### User State
```typescript
{
  id: string
  email: string
  name: string
  avatar_url: string | null
  created_at: timestamp
  preferences: {
    dark_mode: boolean
    notifications_enabled: boolean
    notification_frequency: 'never' | 'daily' | 'weekly' | 'random'
    notification_time: string // "09:00"
    reminder_lead_time: number // days
  }
}
```

### Partner State
```typescript
{
  id: string
  user_id: string // FK
  name: string
  photo_url: string | null
  relationship_start_date: date | null
  bio: string | null
  created_at: timestamp
  updated_at: timestamp
}
```

### Memory State
```typescript
{
  id: string
  user_id: string // FK
  partner_id: string // FK
  type: 'text' | 'voice' | 'photo' | 'gift' | 'occasion'
  content: string // text or transcription
  audio_url: string | null
  image_url: string | null
  tags: string[] // mood, occasion, custom
  liked: boolean
  pinned: boolean
  archived: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

### Reminder State
```typescript
{
  id: string
  user_id: string // FK
  partner_id: string // FK
  type: 'gift' | 'occasion'
  title: string
  date: date
  reminder_time: timestamp // Specific notification time
  category: string // Birthday, Anniversary, etc.
  price: number | null
  completed: boolean
  snoozed_until: timestamp | null
  recurring: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

### Global UI State
```typescript
{
  isLoading: boolean
  error: string | null
  toast: { 
    message: string
    type: 'success' | 'error' | 'info'
    id: string
  } | null
  modalOpen: {
    type: string
    data?: any
  } | null
  draftMemory: Memory | null // In localStorage
}
```

---

## NAVIGATION ARCHITECTURE

### Mobile Navigation (Bottom Tab Bar)

```
┌──────────────────────────────────────┐
│       APP CONTENT                    │
├──────────────────────────────────────┤
│         [+] ← FAB (right side, fixed)│
│                                      │
│ 🏠 Home │ 👤 Person │ 🔔 Reminders  │
└──────────────────────────────────────┘
```

**Tabs:**

| Icon | Name | Screen | Default? | Badge |
|------|------|--------|----------|-------|
| 🏠 | Home | Memory feed | Yes (auth) | None |
| 👤 | Person | Partner profile + settings | No | None |
| 🔔 | Reminders | Reminders/occasions | No | Red dot if due today |

**FAB:**
- Position: Fixed, right side, above tab bar
- Size: 56×56px
- Color: Coral (#FF6B6B)
- Icon: [+]
- Action: Open Quick Capture modal
- Gesture: Tap (primary), long-press for menu (optional)

### Desktop Navigation (Sidebar)

```
┌──────────────┬─────────────────────┐
│              │                     │
│ Cherish Logo │                     │
│              │   APP CONTENT       │
│ 🏠 Home      │                     │
│ 👤 Person    │                     │
│ 🔔 Reminders │                     │
│              │                     │
└──────────────┴─────────────────────┘
```

### URL Structure (Next.js App Router)

```
/
  ├─ /auth/signin
  ├─ /onboarding/1, /onboarding/2, /onboarding/3
  ├─ /home
  │   ├─ ?sort=newest|oldest|random|mood
  │   ├─ ?filter=text|voice|photo|gift|occasion
  │   └─ ?search=query
  ├─ /memories/:id
  ├─ /memories/:id/edit
  ├─ /person
  │   ├─ ?tab=timeline|gallery|moods
  │   └─ ?share (share mode)
  ├─ /insights
  ├─ /reminders
  │   ├─ ?tab=upcoming|gifts|occasions
  │   └─ ?view=list|calendar
  └─ /404
```

### Navigation Gestures (Mobile Priority)

| Gesture | Action | Priority |
|---------|--------|----------|
| Swipe right | Go back | Primary |
| Tap [← Back] | Go back | Fallback |
| Swipe down | Close modal | Primary (mobile) |
| Tap [X] | Close modal | Fallback |
| Swipe left (card) | Reveal actions | Primary |
| Long press (card) | Context menu | Alternative |
| Tap [⋮] | Context menu | Fallback |

**Haptic Feedback:**
- Swipe completion: Light (10ms)
- Long press: Medium (200ms)
- Action confirm: Success pattern
- Action error: Error pattern
- **Toggle:** Can disable in settings

---

## EDGE CASES & ERROR HANDLING

### Network & Sync Errors

#### Low Connectivity
```
User drafts memory while offline
  ↓
Toast: "Offline — Your memory is saved locally"
  ↓
On reconnect:
  ├─ Detect online status (navigator.onLine)
  ├─ Sync draft to Supabase
  ├─ Clear localStorage draft
  └─ Toast: "Memory synced! 💕"
```

#### API Error (500, timeout)
```
User saves memory
  ↓
API call fails
  ↓
Toast: "Oops! Couldn't save. Retrying..."
  ├─ Auto-retry after 2 seconds
  ├─ If retry fails: Show [Retry] button
  ├─ Draft saved to localStorage
  └─ User can manually retry
```

### Permission Errors

#### Camera/Microphone Not Granted
```
User taps [Record] or [Photo]
  ↓
Browser permission prompt
  ├─ If granted: Continue
  ├─ If denied: Show error banner
  │   ├─ "Camera/Microphone permission required"
  │   └─ [Open Settings] button
  └─ If dismissed: Retry prompt next time
```

### Validation Errors

#### Empty Memory Submit
```
User taps [Save Memory] with empty content
  ↓
Error badge: "Please add a note, photo, or voice memo"
  ├─ Red border on empty field
  └─ Focus returns to field
```

#### Invalid Reminder Date
```
User sets date in past (without "today")
  ↓
Error: "Date cannot be in the past"
  ├─ Date picker highlights invalid range
  └─ Or auto-adjust to today if applicable
```

### Session & Auth Errors

#### Session Expired
```
User interacts after session expires
  ↓
API returns 401
  ↓
Modal: "Your session expired. Please sign in again."
  ├─ [Sign In] button → OAuth flow
  └─ Auto-redirect on re-auth
```

### Empty States

#### No Memories
```
Illustration: Happy couple
Title: "No memories yet"
Subtitle: "Start by adding your first memory!"
CTA: [Add Your First Memory] → Quick Capture
```

#### No Reminders
```
Illustration: Calendar
Title: "No reminders set"
Subtitle: "Add an occasion to remember"
CTA: [Add Occasion] [Add Gift Idea]
```

---

## KEY DESIGN DECISIONS

### 1. Gift Ideas vs. Occasion Reminders

**Gift Idea (Tab 4):**
- **Purpose:** Capture inspiration for future gifts
- **Date:** Not required (undated)
- **Trigger:** Manual browse in Reminders → Gifts tab
- **Use Case:** "I saw something they'd love"
- **Example:** Omega Seamaster Watch, $5000, found on luxury watch site
- **When used:** Before you know the occasion

**Occasion Reminder (Tab 5):**
- **Purpose:** Don't forget important dates
- **Date:** Required (actual date)
- **Trigger:** Automatic notification on schedule
- **Use Case:** "Don't forget their birthday"
- **Example:** Birthday on March 30, remind 1 week before
- **When used:** You know the date (birthday, anniversary, etc.)

### 2. Like Feature ([❤️])

**Function:**
- Tap heart to like/unlike memory
- Heart fills with color (liked state), outline (unliked)
- Count updates in real-time
- Different from Pin (which is organization)

**Why it exists:**
- Emotional favoriting ("I love this memory")
- Data signal for Insights ("Your 5 most-loved memories")
- Micro-interaction that feels good to tap
- Powers "Favorites" filter in feed

### 3. Tags & Filtering

**Predefined Tags:** Happy, Romantic, Grateful, Funny, Thoughtful, Adventure, Intimate, Quiet-moment, Long-distance, Inside-joke, Made-up, Anniversary, First-time, Date-night

**Why helpful:**
- Organize memories by feeling
- Filter feed: "Show all romantic moments"
- Insights: "40% of your memories are happy"
- Re-discovery: "Random grateful memory" mood boost
- Search: Find moments by tag

**Max 5 tags per memory** (keeps feed signal clean)

### 4. Tone & Language

**Partner-Specific, Inclusive:**
- ✅ Use "partner", "your person", "they/them"
- ❌ Avoid "boyfriend/girlfriend", gendered pronouns
- ✅ "Remember what matters — together"
- ❌ "Remember what matters — to you"

**Playful & Warm:**
- Not saccharine or cringey
- Emotional but not sappy
- Modern couple app vibe

### 5. Draft Saving

**Mechanism:**
- Auto-save to localStorage every 30 seconds
- No permissions required (built into browser)
- On app re-open: Show draft resume prompt
- User can [Continue] or [Discard]

**Why localStorage?**
- Simple, reliable, no backend calls
- Works offline
- ~5-10MB available (plenty for text/audio drafts)
- Auto-cleared on logout

### 6. Gesture-First Navigation

**Mobile Priority:**
- Swipe right → Go back (primary)
- Tap [← Back] → Go back (fallback)
- Swipe left on card → Reveal actions (primary)
- Long press → Context menu (fallback)
- Swipe down → Close modal (primary, mobile only)
- Haptic feedback on swipe completion

**Desktop:**
- Sidebar nav + Back buttons
- Gestures less critical

### 7. Encryption & Privacy

**Phase 1 (Now):**
- ✅ HTTPS/TLS in transit
- ✅ Row-level security (RLS) in Supabase
- ✅ Google OAuth authentication

**Phase 2 (Weeks 3-4):**
- ✅ Server-side encryption at rest (pgcrypto)
- ✅ Client-side audio encryption
- ✅ Privacy status badges on memories

**Phase 3+ (Post-launch):**
- ✅ End-to-end encryption (advanced users)
- ✅ Key backup/recovery flow
- ✅ Zero-knowledge architecture review

**Privacy Policy (Draft):**
```
"Cherish encrypts all memories and personal data at rest.
Voice notes are encrypted client-side before upload.
Supabase handles key management.
Only you can access your memories.
We never sell data."
```

### 8. Reminders: Dual Notification Times

**Global Notification Time (Settings):**
- Controls memory capture prompts
- "Every day at 9 AM, remind me to reflect"
- One-time setting for all daily prompts

**Per-Reminder Notification Time (Quick Capture):**
- Specific timing for each occasion
- "Notify me on March 23 at 10 AM (1 week before birthday)"
- Can override default with custom time
- Optional: Leave blank to use global time

**Why both?**
- Flexibility: Different occasions need different timings
- Simplicity: Default time works for most users
- Personalization: Users can customize individual reminders

### 9. Multi-Partner Roadmap

**V2:** Single partner only (simplest mental model)

**Future (Phase 3+):**
- 👤 Person tab becomes dropdown: "Switch to Emma"
- All views filter by selected partner
- Memories stay linked to correct person

**For now:** Hide multi-partner UI, keep it simple.

### 10. Insights (AI Timeline)

**Phase 1: Rule-Based (No AI)**
- Stats: Count, streaks, dates
- Charts: Mood breakdown, activity timeline, memory types
- Triggers: Rule-based (streak, inactivity, date approaching, mood trending)

**Phase 2: Claude-Powered**
- Memory summaries: "You've been romantic lately..."
- Suggested reminders: "Should I remind you about monthly date nights?"
- Gift recommendations: "They love coffee, here are ideas..."
- Mood coaching: "You've been reflective, want to plan something fun?"

**Why Person-Specific?**
- Generic insights are boring
- Personal data = personal insights
- Drives engagement & retention

**Cost:**
- ~1000 tokens per summary = $0.0003
- Weekly for 1000 users = ~$3/week
- Affordable and justified

---

## IMPLEMENTATION PRIORITIES

### Phase 1: MVP (Week 1-2)
- ✅ Google OAuth + onboarding
- ✅ Home dashboard (memory feed, basic card)
- ✅ Quick Capture (text, photo, voice tabs)
- ✅ Person profile (basic view)
- ✅ Core settings (dark mode, notifications)
- ✅ Draft saving (localStorage)

### Phase 2: Core Features (Week 3-4)
- ✅ Memory detail view
- ✅ Memory edit/delete
- ✅ Tags system (predefined + custom)
- ✅ Reminders dashboard (list + calendar views)
- ✅ Like / Pin / Archive actions
- ✅ Search & filter
- ✅ Encryption at rest (pgcrypto)
- ✅ Person profile views (timeline, gallery, moods)

### Phase 3: Polish & AI (Week 5-6)
- ✅ Rule-based Insights dashboard
- ✅ Notifications system (push + in-app)
- ✅ Dark mode refinement
- ✅ Data export
- ✅ Micro-interactions & animations
- ✅ Gesture support (swipe, long-press)
- ✅ Error handling & edge cases
- ✅ Claude API: Insight summaries, recommendations
- ✅ Performance optimization

---

## NOTES FOR DESIGN & DEVELOPMENT

1. **Responsive Design:** Test at 320px, 768px, 1024px, 1440px
2. **Modal Behavior:** Full-screen on mobile (<768px), drawer/modal on desktop
3. **Infinite Scroll:** Cursor-based pagination (more efficient than offset)
4. **Optimistic Updates:** Like/Pin/Archive update UI immediately, sync in background
5. **Image Optimization:** Lazy load, compress, use WebP with fallbacks
6. **Accessibility:** Tab order, ARIA labels, keyboard navigation, color contrast
7. **Performance:** Code-split modals, virtual scrolling for long lists, cache management
8. **Animations:** Subtle transitions (200ms), glassmorphism cards, micro-interactions
9. **Mobile UX:** Bottom tab bar visible, FAB accessible thumb zone, swipe-friendly
10. **Dark Mode:** Invert colors, maintain contrast, preserve glassmorphism effect

---

**This document is your single source of truth for design, development, and QA.**

Next steps: Design System document → Figma/Stitch renders → Cursor rules → Development
