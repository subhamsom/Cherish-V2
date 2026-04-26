# Cherish Component Rules

## Folder structure
- `src/components/ui/` — shadcn primitives only. Never modify these.
- `src/components/cherish/` — all Cherish-specific components. Always import from here before writing inline UI.

## Before writing any UI code
1. Check if the component already exists in `src/components/cherish/`
2. If yes, import it. Never rewrite it inline.
3. If no, create it in the correct subfolder, then import it.

## Subfolders
- `src/components/cherish/cards/` — MemoryCard, ReminderCard
- `src/components/cherish/common/` — TagPill, TagPillScroller, TitleInput, TopBar, FAB
- `src/components/cherish/layout/` — AppShell, BottomNav, Sidebar

## Design tokens — never hardcode these differently
- Primary accent: #FF6B6C (coral) — used ONLY on active Save button and urgent reminder labels
- Background: #fafafa
- Card background: #ffffff
- Tag pill: bg-gray-100, text-gray-700, rounded-full
- Titles and large inputs: font-serif (this maps to Fraunces)
- Body text: font-sans (this maps to DM Sans)
- Card border radius: rounded-2xl
- Card shadow: shadow-sm

## shadcn usage
- Always use shadcn for: Dialog, Popover, Calendar, Sheet, Toast, Select, Switch, Input, Textarea
- Never rewrite shadcn components from scratch

## Do not
- Write inline styles for spacing, color, or typography — use Tailwind classes
- Create one-off styled divs for things that should be components
- Add three-dot kebab menus to MemoryCards
- Use any font or colour not listed in design tokens above