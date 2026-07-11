# Cherish V2 — North Star

**Status:** Current vision, supersedes the "Vision" section of `CHERISH_V2_PRODUCT_SPEC.md`
**Last Updated:** 2026-07-09
**Owner:** Subham

This doc exists so the product direction survives gaps between working sessions. If you're picking this project back up after time away, read this first.

---

## Vision

Cherish isn't just a memory journal — it's a **memory-collection engine that powers an AI advisor on your relationship**. You capture moments (typed or spoken); the app quietly builds an ever-evolving understanding of your partner from them; and that understanding becomes something you can actually query when you need it — starting with "what should I get her that's personal?"

The original product spec (March 2026) described a 3-tab journal app with reminders. That's still the substrate, but it's no longer the destination.

---

## Architecture: Four Tabs

1. **Home** — capture and browse memories (text, voice). ✅ Built.
2. **Reminders** — occasions, gift ideas, follow-ups. ✅ Built, email delivery being finished now.
3. **Partner** — the AI-built, ever-evolving persona of your partner, generated and updated from the memories you feed it. ✅ Started (AI profile cards, constellation loading).
4. **Ask** — new tab, not yet built. A direct query interface into the partner persona: ask a specific question ("what's something personal I could get her?"), get concrete, grounded suggestions pulled from actual recorded memories — not generic advice.

## The Core Loop

```
Capture a memory (type or speak)
  → AI persona of partner updates (Partner tab reflects it)
  → Ask tab lets you query that persona for concrete help
  → Nudges bring you back to capture more, keeping the loop alive
```

The Ask tab's value is entirely downstream of memory volume and persona depth — it should not be built until there's real data for it to draw on, or first impressions will be hollow.

## Nudges (not yet built)

The user won't reliably know what to record or when. The app needs to prompt, in two distinct modes:

- **Follow-up nudges** — data-driven, tied to something already logged (an open reminder, a thread from a past memory worth circling back to).
- **Presence nudges** — no specific trigger, just a prompt to capture *something* and stay present in the relationship, not just administer it.

These likely reuse the cron/email infrastructure being built for reminder delivery, but are a distinct system with their own logic for *when* and *what* to nudge about.

## Roadmap Sequencing (and why)

1. **Finish reminder email delivery** (in progress) — the cron/email plumbing that nudges will later reuse.
2. **Nudges** — highest leverage next step. Directly grows the memory data everything downstream depends on.
3. **Voice capture** — lowers friction to record, especially in response to a nudge. Also closes a gap from the original spec that was never built.
4. **Ask tab** — last, once there's enough memory density for it to be useful on day one.

Deviating from this order (e.g. building Ask early to validate the interaction shape) is reasonable but trades a hollow early version for faster signal — a deliberate call, not a default.

## Also true, from the original spec, still standing

- Real users eventually, not just personal use — data handling (encryption at rest, delete-account flow, error/retry UX) matters more than it would for a toy project.
- Mobile-first PWA, Google OAuth only, inclusive partner-neutral language.
- Design tokens and component rules: see `AGENTS.md`.
