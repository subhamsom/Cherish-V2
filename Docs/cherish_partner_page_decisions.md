# Cherish — Partner Page & AI Layer: Decision Document
**Session date: May 6, 2026**

---

## What we decided and why

### 1. The AI layer ships now — not in V2

**Decision:** The AI partner profile is built immediately, not deferred.

**Why:** The app without AI is a notes app with a pretty skin. There is no "wow" moment without the AI layer. The memories and reminders are fuel — the AI is the product. Showing the app without AI gets the reaction "cute hobby project." Showing it with AI should produce "I need to download this right now."

---

### 2. No fixed section buckets

**Decision:** The AI decides what sections to show, what to name them, and what to put in them. There are no pre-defined buckets like "She Loves / Her Rituals / Careful With."

**Why:** Fixed buckets create two problems. First, if the memories don't contain the right signals, the bucket is empty or generic — which is worse than nothing. Second, every partner is different. The section headings themselves should feel discovered, not templated. "What She Reaches For" is more surprising and true than "Things She Likes."

**Guardrails given to the AI:**
- Only surface a section if there are at least 2-3 clear signals in the memories — never extrapolate from a single mention
- Maximum 4 sections — depth over breadth
- 3 to 6 items per section — under 3 feels thin, over 6 starts feeling like a list
- Write like a perceptive best friend, not a data analyst or therapist
- Avoid the obvious — skip anything anyone could guess
- Return structured JSON so the app can render it reliably

---

### 3. Two-state threshold system

**Decision:** 15 memories is the unlock threshold. Two states only — under 15 and 15 and above.

**Why 15, not 20:** 20 starts to feel like a milestone you're chasing. 15 can sneak up on you if you're genuinely using the app. The goal is the threshold feeling like a surprise, not a finish line.

**Why two states, not four:** Four states (0-9, 10-19, 20-29, 30+) adds complexity without meaningfully improving the experience. The important moment is the first unlock — before and after.

**State 1 — Under 15 memories: "Cherish is listening"**
- Header always works: name, photo/avatar, relationship duration, stats row
- A warm poetic progress card — language like "Cherish is starting to piece her together" — no cold progress bar, no "11/15 complete"
- Two faded teaser sections — static, same for everyone, evocative generic headings, content blurred/desaturated like frosted glass but readable in shape
- One nudge line below: "Save 15 moments and Cherish will find her own patterns."

**State 2 — 15+ memories: AI profile active**
- AI-generated sections appear (2-4, decided by Claude)
- Dynamic headings invented by Claude based on what it found
- Specific content, Claude's voice
- "Ask me anything about her" card at the bottom (leads to ASK tab, V2)

---

### 4. The loading experience

**Decision:** A pulsing coral orb animation with rotating serif text lines beneath it.

**Why:** A breathing orb communicates "thinking" not "waiting." The loading moment is emotionally charged — the user knows something is about to be revealed about their person. It deserves more than a spinner.

**The rotating lines (cycle every 2-3 seconds):**
- "Reading through your moments..."
- "Looking for the patterns only you would notice..."
- "Putting her together, piece by piece..."
- "Almost there..."

**Technical note:** Pure CSS animation — lightweight, works on every device, never fails to load.

**Caching rule:** The loading experience happens once per session maximum. After the first load, the result is cached by React Query. The AI is re-triggered only when 3 or more new memories have been added since the last generation. The result is also stored in Supabase so it persists across sessions and devices.

---

### 5. API cost and caching strategy

**Decision:** Cache aggressively. Never call the Claude API on every page open.

**Cost reality:** Each AI call (15-30 memories) costs roughly ₹0.05-0.15. Manageable at small scale, real cost at 10,000+ users — which is when V3 monetisation kicks in.

**Caching rules:**
- Store the AI-generated profile in Supabase alongside a `last_generated_at` timestamp and a `memory_count_at_generation` field
- On Partner page load: if result exists and fewer than 3 new memories have been added since last generation, serve the cached result
- If 3+ new memories have been added: regenerate in background, show cached result while loading, swap when ready
- React Query handles client-side caching (staleTime: 60s, gcTime: 5min as already configured)

---

### 6. Security decisions

**Non-negotiable rules for implementation:**
- The Anthropic API key lives server-side only, inside a Next.js API route — never in any client-side file
- The API route that calls Claude must verify the user's authenticated session before fetching their memories
- Rate limiting on the AI route: if a profile has been generated in the last hour for this user, return the cached version — do not call Claude again regardless of what the client requests
- The memories fetched for AI analysis use the same server-side partner lookup already in place (fixed last session) — partner_id never comes from the client

---

### 7. Tab structure

**Decision:** Build the Partner page fully first. Then add the ASK tab as a fourth tab afterward.

**V1 nav:** HOME · REMINDERS · PARTNER (3 tabs, as currently exists)
**After Partner page is complete:** HOME · REMINDERS · PARTNER · ASK (4 tabs)

The "Ask me anything about her" card at the bottom of the Partner page acts as a preview/teaser for the ASK tab while it doesn't exist yet.

---

### 8. Privacy acknowledgement

**Decision:** One honest line somewhere visible on the Partner page or in settings: "Your memories help Cherish understand your partner. They're never used to train AI models."

No legal wall of text. Just one true, human sentence.

---

## Build order for this feature

| Step | What | Notes |
|---|---|---|
| 1 | Partner page shell | Header, avatar, stats, layout, design tokens. No AI yet. |
| 2 | Faded teaser state | Static. Under-15 experience. Progress nudge. |
| 3 | Claude API route | Server-side only. Secure. Rate limited. |
| 4 | Loading animation | Pulsing coral orb + rotating serif lines. |
| 5 | AI section renderer | Display whatever Claude returns. Dynamic headings. |
| 6 | Supabase caching | Store result + timestamps. Regeneration logic. |

---

## What can break — watch carefully

- **Hallucination:** Claude may surface things not clearly in the memories. Prompt guardrails address this but review output with real data before showing anyone.
- **Malformed JSON from Claude:** The parser must handle gracefully — show a fallback state, never crash.
- **Long response times:** 8-12 seconds on large memory sets. The loading animation handles indefinite waits — no fixed timer.
- **API key placement:** Cursor sometimes puts secrets in the wrong place. Verify server-side placement before every commit.
- **Stale cache:** Handled by the 3-new-memories regeneration rule.

---

## Open questions (not blocking, note for later)

- Should the AI profile regenerate on a time schedule (e.g. once a week) even if fewer than 3 memories were added? Probably yes in V2.
- What language does the Partner page use if the partner's gender is unknown or non-binary? "She Loves" is gendered. Needs a solution before public launch.
- The teaser sections — what are the two evocative generic headings? Decide before building. Suggestions: "What She Reaches For" and "The Way She Moves Through the World."

---

## Estimated timeline

- Partner page with full AI layer: ~3 sessions
- ASK tab (basic): ~2 sessions
- Total to demoable AI version: ~6-8 sessions

