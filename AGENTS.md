# Cherish V2 — Project Rules

**Product:** Cherish v2 - Relationship Memory Companion App
**Platform:** Mobile-first PWA (Next.js App Router), desktop responsive
**Tech Stack:** Next.js (App Router) + TypeScript + Supabase + Tailwind CSS + shadcn/ui + Vercel + Resend + Claude API
**Target User:** Someone in a romantic relationship who wants to remember and cherish moments with their partner

---

## Component Rules

### Folder structure
- `src/components/ui/` — shadcn primitives only. Never modify these.
- `src/components/cherish/` — all Cherish-specific components. Always import from here before writing inline UI.
  - `src/components/cherish/cards/` — MemoryCard, ReminderCard
  - `src/components/cherish/common/` — TagPill, TagPillScroller, TitleInput, TopBar, FAB
  - `src/components/cherish/layout/` — AppShell, BottomNav, Sidebar

### Before writing any UI code
1. Check if the component already exists in `src/components/cherish/`.
2. If yes, import it. Never rewrite it inline.
3. If no, create it in the correct subfolder, then import it.

### Design tokens — never hardcode these differently
- Primary accent: `#FF6B6C` (coral) — used ONLY on the active Save button and urgent reminder labels. Not a global gradient/theme color.
- Background: `#fafafa`
- Card background: `#ffffff`
- Tag pill: `bg-gray-100`, `text-gray-700`, `rounded-full`
- Titles and large inputs: `font-serif` → Fraunces (`--font-heading` / `--font-serif`)
- Body text: `font-sans` → DM Sans (`--font-sans`)
- Card border radius: `rounded-2xl`
- Card shadow: `shadow-sm`

### shadcn usage
- Always use shadcn for: Dialog, Popover, Calendar, Sheet, Toast, Select, Switch, Input, Textarea.
- Never rewrite shadcn components from scratch.

### Do not
- Write inline styles for spacing, color, or typography — use Tailwind classes.
- Create one-off styled divs for things that should be components.
- Add three-dot kebab menus to MemoryCards.
- Use any font or color not listed in the design tokens above.

---

## Code Style & Structure

### Naming Conventions
- **Components:** PascalCase (Button, MemoryCard, QuickCaptureModal)
- **Files:** kebab-case for utilities/hooks (`use-memories.ts`, `api-client.ts`)
- **CSS Classes:** Tailwind utilities only, no custom class names (exception: component wrappers)
- **Variables:** camelCase for functions/variables, UPPER_CASE for constants
- **Types:** PascalCase with `Props` suffix (`ButtonProps`, `MemoryCardProps`)
- **TypeScript:** always, no `any`

### Component Requirements
- Variants (primary/secondary/etc.), sizes (sm/md/lg) via props — never copy-paste styling
- Test in light + dark mode
- Accessible: ARIA labels, visible focus rings, keyboard nav
- Responsive: 320px, 768px, 1440px
- Keep component files under ~300 lines

### API Routes / Data
- Supabase client lives in `src/lib/supabase.ts`
- Always handle errors in API calls and Supabase queries — no unguarded `await`
- Use `next/image` for images, never a raw `<img>` tag

### Git Commit Messages
Format: `type(scope): description` — e.g. `feat(memories): add voice note recording`, `fix(ui): correct button padding in dark mode`

---

## Accessibility (WCAG AA minimum)
- Color Contrast: 4.5:1 minimum for text
- Focus States: every interactive element has a visible outline
- ARIA Labels: buttons, icons, form fields
- Keyboard Navigation: tab order, Enter/Space activation, Escape to close
- No color-only indicators

---

## Review Checklist Before Commit
- [ ] Follows the component/folder rules above (no duplicate/inline UI)
- [ ] Design tokens used, nothing hardcoded
- [ ] TypeScript types complete (no `any`)
- [ ] Light + dark mode checked
- [ ] Responsive at 320px / 768px / 1440px
- [ ] Accessibility: focus states, ARIA labels, keyboard nav
- [ ] No console errors or warnings
- [ ] Commit message formatted correctly
