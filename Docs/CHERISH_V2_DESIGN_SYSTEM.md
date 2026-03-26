# Cherish V2 — Design System

**Version:** 2.0 (Editorial Intimacy Edition)  
**Status:** Ready for Implementation  
**Date:** March 2026  
**Philosophy:** Editorial Intimacy + Component-Driven Development  
**Purpose:** Single source of truth for all design decisions, components, and patterns

---

## TABLE OF CONTENTS

1. [Creative North Star](#creative-north-star)
2. [Design Philosophy](#design-philosophy)
3. [Color System & Surface Architecture](#color-system--surface-architecture)
4. [Typography: The Editorial Voice](#typography-the-editorial-voice)
5. [Spacing & Layout](#spacing--layout)
6. [Elevation & Depth](#elevation--depth)
7. [Boundaries: The "No-Line" Rule](#boundaries-the-no-line-rule)
8. [Components](#components)
9. [Patterns & Interactions](#patterns--interactions)
10. [Responsive Breakpoints](#responsive-breakpoints)
11. [Accessibility](#accessibility)
12. [Dark Mode](#dark-mode)
13. [Component-Driven Development Strategy](#component-driven-development-strategy)
14. [Implementation Notes](#implementation-notes)

---

## CREATIVE NORTH STAR

**"The Living Journal"**

In an era of cold, high-frequency social apps, Cherish feels like a heavy-stock paper notebook or a quiet conversation in a sun-drenched room. We move beyond template UI by rejecting rigid, boxed-in layouts. Instead, we embrace:

- **Intentional Asymmetry** — Overlapping elements, off-center padding, subtle rotations (3°)
- **Tonal Depth** — Layered colors create natural lift without heavy shadows
- **Generous Whitespace** — Breathing room between sections using upper tiers of spacing scale
- **Typography-First Hierarchy** — Text size and weight define importance, not boxes or borders
- **Warm, Organic Feel** — Every interaction feels like an invitation, not a notification

**Result:** A digital companion that feels personal, intentional, and lived-in.

---

## DESIGN PHILOSOPHY

### Core Principles

1. **Typography First** — Hierarchy comes from size, weight, color of text. Boxes are secondary.
2. **Color Blocks Over Borders** — Visual clarity through background color shifts, NEVER solid lines.
3. **Generous Spacing** — Use spacing tiers 6, 8, 10 (24px, 32px, 40px) between major sections.
4. **Warmth Always** — Every color should feel sun-drenched, never cold or clinical.
5. **Intentional Asymmetry** — Break the grid. Overlap elements. Embrace organic flow.
6. **Glassmorphism for Premium** — Frosted glass (16px blur) + subtle gradients = tactile, elevated.
7. **Ambient Depth** — Warm, tinted shadows. No harsh drop shadows.
8. **No Pure Black** — Always use warm off-blacks (#2D1B1B, never #000000).
9. **Accessibility First** — WCAG AA contrast, keyboard nav, no color-only indicators.
10. **Editorial Refinement** — Lead with display typography, embrace asymmetrical layouts.

---

## COLOR SYSTEM & SURFACE ARCHITECTURE

### Primary Palette: Rose & Cream Foundation

```css
/* Primary (Romantic, Energetic) */
--color-primary: #FF6B6B;              /* Coral - main CTA, highlights */
--color-primary-dark: #E55555;         /* Coral dark - hover, pressed */
--color-primary-light: #FF8A8A;        /* Coral light - disabled, subtle */
--color-primary-gradient-start: #FF6B6B;
--color-primary-gradient-end: #FFB4A2; /* Gradient to peach */

/* Secondary (Warmth, Softness) */
--color-secondary: #FFB4A2;            /* Peach - secondary actions */
--color-secondary-dark: #FFA08E;       /* Peach dark - hover */
--color-secondary-light: #FFC9BC;      /* Peach light - disabled */

/* Surface Hierarchy (Critical for "No-Line" Rule) */
--color-surface: #FFF0EC;              /* Base background (warmest cream) */
--color-surface-container-low: #FFF5F2;/* Light sections, slight depth */
--color-surface-container: #FFFBFA;    /* Medium sections */
--color-surface-container-high: #FFE8E0; /* Elevated sections, cards */
--color-surface-container-highest: #FFD9CF; /* Prominent cards, floats */

/* Text (Warm, Never Pure Black) */
--color-text-dark: #2D1B1B;            /* Primary text (NOT #000000) */
--color-text-medium: #5C4447;          /* Secondary text, labels */
--color-text-light: #8B7073;           /* Tertiary text, disabled, hints */
--color-text-variant: #A89A93;         /* Subtle, small text */

/* Semantic Colors */
--color-success: #4CAF50;
--color-error: #F44336;
--color-warning: #FF9800;
--color-info: #2196F3;
```

### Surface Architecture Rules

**Rule 1: Boundaries Through Color, Not Lines**
```
Base: surface (#FFF0EC)
  └─ Section: surface-container-low (#FFF5F2)
      └─ Card: surface-container-high (#FFE8E0)
          └─ Interactive: surface-container-highest (#FFD9CF)
```

**NO solid 1px borders.** Visual separation happens through background color shifts.

**Rule 2: Glass & Gradient for Premium Feel**
- **Floating UI (headers, modals):** 16px backdrop-blur on 80% opacity surface
- **Primary CTAs:** Linear gradient from primary (#FF6B6B) to secondary (#FFB4A2) at 135°
- **Result:** Tactile, premium, elevated without heaviness

**Rule 3: Ambient Shadows (Warm, Tinted)**
```
Standard shadow (for floats):
  X: 0, Y: 8px, Blur: 24px
  Color: #2D1B1B (warm black) at 6% opacity
  
Result: Mimics soft sunlight on paper, not "dirty" grey shadow
```

---

## TYPOGRAPHY: THE EDITORIAL VOICE

### Font Pairing: Serif + Sans

```css
/* Noto Serif - The Human Voice */
--font-serif: 'Noto Serif', serif;
--font-serif-letter-spacing: -1%;  /* Slightly tight for modern elegance */

/* Plus Jakarta Sans - Clean, Geometric */
--font-sans: 'Plus Jakarta Sans', sans-serif;
--font-sans-letter-spacing: 0%;
```

### Type Scale (Mobile First)

```css
/* Desktop Scale */
--display-lg: 2.5rem / 3rem;   /* 40px / 48px - Editorial hero */
--display-md: 2rem / 2.5rem;   /* 32px / 40px - Page titles */
--headline-lg: 1.75rem / 2.25rem; /* 28px / 36px - Section headers */
--headline-md: 1.5rem / 2rem;  /* 24px / 32px - Subsection headers */
--headline-sm: 1.25rem / 1.75rem; /* 20px / 28px - Card titles */

--title-lg: 1.125rem / 1.5rem; /* 18px / 24px - Lists, labels */
--title-md: 1rem / 1.5rem;     /* 16px / 24px - Buttons, controls */
--title-sm: 0.875rem / 1.25rem; /* 14px / 20px - Small labels */

--body-lg: 1rem / 1.625rem;    /* 16px / 26px - Long-form reading (1.6 LH) */
--body-md: 0.9375rem / 1.5rem; /* 15px / 24px - Standard body */
--body-sm: 0.875rem / 1.25rem; /* 14px / 20px - Secondary text */

--label-lg: 0.75rem / 1rem;    /* 12px / 16px - All caps labels */
--label-md: 0.6875rem / 1rem;  /* 11px / 16px - Small labels */
--label-sm: 0.625rem / 0.875rem; /* 10px / 14px - Captions */

/* Mobile Scale (reduce by ~10-15%) */
@media (max-width: 640px) {
  --display-lg: 2rem / 2.5rem;
  --display-md: 1.5rem / 2rem;
  --headline-lg: 1.25rem / 1.75rem;
  --body-lg: 0.9375rem / 1.5rem;
}
```

### Hierarchy Rules

**Rule 1: Lead With Editorial Weight**
Every screen should start with a `display-md` or `headline-lg` in serif. This sets the editorial tone immediately.

**Rule 2: Body Typography for Breathing**
Body text should use `--body-lg` with `line-height: 1.6` minimum. This creates the "journal" feel—spacious, readable, inviting.

**Rule 3: Left-Alignment for Asymmetry**
Never center-align more than 3 lines of text. Use intentional left-alignment with generous `16px` left-padding on hero sections to create asymmetrical breathing room.

**Rule 4: Serif for Warmth, Sans for Clarity**
- **Serif (Noto Serif):** Headings, display text, emotional copy → "human" voice
- **Sans (Plus Jakarta Sans):** Body, buttons, labels, data → clean utility

**Rule 5: No Weights Below 400 or Above 700**
- 400 (regular) = body text
- 600 (semibold) = labels, buttons
- 700 (bold) = headings

---

## SPACING & LAYOUT

### Spacing Scale (8px Base)

```css
--space-1: 4px;      /* Micro: button padding, icon gaps */
--space-2: 8px;      /* Tight: small gaps, tight lists */
--space-3: 12px;     /* Comfortable: card padding, list gaps */
--space-4: 16px;     /* Standard: button padding, form gaps */
--space-5: 20px;     /* Comfortable: section gaps */
--space-6: 24px;     /* Large: major section spacing */
--space-7: 28px;     /* Extra large: hero padding */
--space-8: 32px;     /* Large hero: between major sections */
--space-9: 36px;     /* Extra: rare, for massive hero */
--space-10: 40px;    /* Extra large: breathing room on hero */
```

### Editorial Asymmetry

```css
/* Hero Left-Padding (5.5rem = 88px on large screens) */
.hero-section {
  padding-left: clamp(16px, 8vw, 88px);
  padding-right: var(--space-4);
}

/* Overlapping Cards (3-degree rotation) */
.reflection-cards {
  position: relative;
}

.reflection-card-1 {
  z-index: 2;
  transform: rotate(3deg);
}

.reflection-card-2 {
  z-index: 1;
  transform: translateY(16px) translateX(-8px) rotate(-2deg);
}
```

### Container Widths

```css
--container-xs: 320px;   /* Mobile minimum */
--container-sm: 640px;   /* Tablet */
--container-md: 768px;   /* Small desktop */
--container-lg: 1024px;  /* Desktop */
--container-xl: 1280px;  /* Large desktop */
--max-width: 1200px;     /* Content max width */
```

---

## ELEVATION & DEPTH

### Layering Principle

Depth through **stacking tones**, not shadows:

```
Base: surface (#FFF0EC)
  ↓
Section: surface-container-low (#FFF5F2) — soft lift
  ↓
Card: surface-container-high (#FFE8E0) — visible lift
  ↓
Float: surface-container-highest (#FFD9CF) — prominent
```

Each tier is 1-2% darker, creating natural, ambient depth.

### Ambient Shadows (Warm, Tinted)

```css
/* Standard Shadow (for floating elements) */
box-shadow: 0 8px 24px rgba(45, 27, 27, 0.06);
/* Color: #2D1B1B (warm black) at 6% opacity */

/* Never use grey shadows: NO rgba(0, 0, 0, 0.1) */
/* Never use pure black: NO rgba(0, 0, 0, X) */
```

### Ghost Border Fallback

**If accessibility requires a border:**

```css
border: 1px solid rgba(198, 200, 184, 0.2); /* --color-outline-variant at 20% */
/* This is the only acceptable border for a11y purposes */
```

**NO solid 1px borders for any other reason.**

---

## BOUNDARIES: THE "NO-LINE" RULE

### The Strict Rule
**Solid 1px borders are prohibited for sectioning or visual hierarchy.** The ONLY exception is a 20% opacity "ghost border" for accessibility (focus rings, form validation).

### How to Separate Content

**Instead of:**
```css
/* ❌ DO NOT DO THIS */
border-bottom: 1px solid #FFDDD3;
```

**Do this:**

**Option 1: Color Block**
```css
/* ✅ DO THIS */
background-color: var(--color-surface-container-low);
```

**Option 2: Generous Spacing**
```css
/* ✅ DO THIS */
margin-bottom: var(--space-6);  /* 24px gap = visual separation */
```

**Option 3: Ghost Border (Accessibility Only)**
```css
/* ✅ ACCEPTABLE FOR A11Y */
border-bottom: 1px solid rgba(198, 200, 184, 0.2);
```

### List Separators

**Separate list items with spacing OR color shifts, never lines:**

```css
/* ✅ GOOD: Spacing between items */
.list-item {
  padding: var(--space-4);
  margin-bottom: var(--space-3);
}

/* ✅ GOOD: Alternating backgrounds */
.list-item:nth-child(odd) {
  background-color: var(--color-surface);
}

.list-item:nth-child(even) {
  background-color: var(--color-surface-container-low);
}

/* ❌ BAD: Line separators */
border-bottom: 1px solid #FFDDD3;
```

---

## COMPONENTS

### Buttons

**Primary Button (Gradient)**
```css
background: linear-gradient(135deg, #FF6B6B 0%, #FFB4A2 100%);
color: white;
border-radius: 12px;  /* --radius-xl */
padding: 12px 24px;   /* --space-3 --space-4 */
font-weight: 600;
font-family: var(--font-sans);
transition: all 200ms ease;

&:hover {
  box-shadow: 0 8px 24px rgba(45, 27, 27, 0.12);
  transform: translateY(-2px);
}

&:active {
  transform: translateY(0px);
}
```

**Secondary Button (Surface Container)**
```css
background-color: var(--color-surface-container-high);
color: var(--color-text-dark);
border-radius: 12px;
padding: 12px 24px;

&:hover {
  background-color: var(--color-surface-container-highest);
}
```

**Tertiary Button (Text Only)**
```css
background-color: transparent;
color: var(--color-primary);
font-weight: 600;
padding: 12px 0px 14px 0px;  /* Bottom padding for underline breathing room */
border-bottom: 2px solid var(--color-surface-tint);  /* Ghost underline */

&:hover {
  border-bottom-color: var(--color-primary);
}
```

### Cards

**Base Card (No Borders)**
```css
background-color: var(--color-surface-container-high);
border-radius: 20px;  /* --radius-xl, soft and approachable */
padding: 20px;        /* --space-5 */
box-shadow: 0 8px 24px rgba(45, 27, 27, 0.06);
transition: all 200ms ease;

&:hover {
  background-color: var(--color-surface-container-highest);
  box-shadow: 0 12px 32px rgba(45, 27, 27, 0.1);
  transform: translateY(-2px);
}
```

**Memory Card (Domain-Specific)**
```
Header:
  - Avatar (40px, circular)
  - Name (title-md, serif or sans?)
  - Date ("5 days ago", text-light)

Content:
  - Memory text or media

Tags:
  - Chips (tertiary-container background)

Actions:
  - Heart (like/unlike)
  - Menu ([...])
```

### Inputs

**Text Input (No Box Feel)**
```css
background-color: var(--color-surface-container);
border: none;
border-bottom: 2px solid var(--color-primary);
padding: 12px 16px;   /* --space-3 --space-4 */
font-family: var(--font-sans);
font-size: 16px;

&:focus {
  outline: none;
  border-bottom-color: var(--color-primary-dark);
  background-color: rgba(255, 107, 107, 0.02);  /* Subtle focus tint */
}

&::placeholder {
  color: var(--color-text-light);
}
```

**Label (Always Above Input)**
```css
display: block;
font-size: 12px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.5px;
color: var(--color-text-medium);
margin-bottom: 8px;
```

### Chips & Tags

**Chip (Selectable)**
```css
display: inline-flex;
align-items: center;
gap: 6px;
padding: 6px 12px;
border-radius: 20px;  /* Full rounding */
background-color: var(--color-secondary);
color: var(--color-text-dark);
font-size: 13px;
font-weight: 500;
cursor: pointer;
transition: all 150ms ease;

&:hover {
  background-color: var(--color-secondary-dark);
  transform: scale(1.05);
}

&.selected {
  background-color: var(--color-primary);
  color: white;
}
```

### Modal (Glassmorphism)

```css
/* Backdrop */
.modal-backdrop {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

/* Modal Content */
.modal {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(45, 27, 27, 0.12);
  animation: slideUp 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### Tab Bar (Mobile)

```css
.tab-bar {
  position: fixed;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-top: 1px solid rgba(198, 200, 184, 0.2);  /* Ghost border */
  padding: 12px 0 max(12px, env(safe-area-inset-bottom));
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--color-text-light);
  transition: color 200ms ease;
}

.tab-item.active {
  color: var(--color-primary);
}
```

---

## PATTERNS & INTERACTIONS

### Loading State (Shimmer)

```css
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface-container-low) 25%,
    var(--color-surface-container) 50%,
    var(--color-surface-container-low) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 12px;
}
```

### Toast Notification

```css
.toast {
  background: var(--color-surface-container-highest);
  border-left: 4px solid var(--color-primary);
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 8px 24px rgba(45, 27, 27, 0.1);
  animation: slideIn 300ms ease;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### Heart Bounce (Like Animation)

```css
@keyframes heartBounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.heart-liked {
  color: var(--color-primary);
  animation: heartBounce 500ms ease;
}
```

### Reflection Cards (Overlapping, Rotated)

```css
.reflection-cards {
  position: relative;
  height: 400px;
}

.card-current {
  position: absolute;
  z-index: 2;
  transform: rotate(3deg);
  background: var(--color-surface-container-high);
}

.card-behind {
  position: absolute;
  z-index: 1;
  transform: translateY(20px) translateX(-12px) rotate(-2deg);
  background: var(--color-secondary);
  opacity: 0.7;
}
```

---

## RESPONSIVE BREAKPOINTS

```css
/* Mobile First Approach */

/* Small Devices (320px - 374px) */
@media (max-width: 374px) {
  body {
    font-size: 14px;
  }
  
  .display-lg {
    font-size: 1.75rem;
  }
  
  .container {
    padding: 0 12px;
  }
}

/* Tablets (640px - 767px) */
@media (min-width: 640px) and (max-width: 767px) {
  .grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

/* Desktop (768px+) */
@media (min-width: 768px) {
  body {
    display: grid;
    grid-template-columns: 280px 1fr;
  }
  
  main {
    margin-left: 280px;
  }
  
  .tab-bar {
    display: none;
  }
}

/* Large Desktop (1440px+) */
@media (min-width: 1440px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

---

## ACCESSIBILITY

### Color Contrast (WCAG AA)

✅ Text Dark (#2D1B1B) on Background Cream (#FFF0EC) = 11.5:1  
✅ Primary Coral (#FF6B6B) on white = 4.5:1  
✅ Secondary Peach (#FFB4A2) on white = 4.5:1  

**Test all color combinations with:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Focus States

```css
/* All interactive elements must have visible focus */
button:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* OR use focus ring (browser native) */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### ARIA Labels

```html
<!-- Buttons -->
<button aria-label="Add new memory">+</button>

<!-- Icons (hide from screen readers) -->
<span aria-hidden="true" role="img">❤️</span>

<!-- Form fields -->
<label for="memory-input">What happened?</label>
<textarea id="memory-input" />

<!-- Skip links -->
<a href="#main-content" class="skip-link">Skip to main content</a>
```

### Keyboard Navigation

- All buttons/links keyboard accessible (Tab order)
- Modals trap focus (Tab within modal only)
- Escape key closes modals
- Arrow keys navigate lists/tabs

---

## DARK MODE

### Dark Mode Palette

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Inverted surfaces */
    --color-surface: #1a1614;
    --color-surface-container-low: #2a2419;
    --color-surface-container: #342d26;
    --color-surface-container-high: #3d3530;
    --color-surface-container-highest: #463d35;

    /* Light text */
    --color-text-dark: #faf8f6;
    --color-text-medium: #d8d4cf;
    --color-text-light: #a89a93;

    /* Keep primary colors same (coral/peach pop in dark) */
    --color-primary: #FF6B6B;
    --color-secondary: #FFB4A2;
  }

  .card {
    background: var(--color-surface-container-high);
  }

  .modal {
    background: rgba(42, 36, 25, 0.95);
  }
}

/* Manual toggle */
body.dark-mode {
  /* Apply dark mode palette */
}
```

---

## COMPONENT-DRIVEN DEVELOPMENT STRATEGY

### Phase-Based Component Build

**Phase 1 (Week 1): Foundation**
1. Button (primary, secondary, tertiary, FAB)
2. Card (base, interactive, accent)
3. Input (text, textarea, label)
4. Chip/Tag (selected, disabled)

**Phase 2 (Week 2): Containers**
5. Modal (with glassmorphism)
6. Tab Bar (mobile navigation)
7. Sidebar (desktop navigation)
8. Toast (notifications)

**Phase 3 (Week 2-3): Domain-Specific**
9. Memory Card (with swipe actions)
10. Quick Capture Modal (5 tabs)
11. Person Profile Header
12. Reminder Card

### Iteration Per Component

**Step 1: Structure/Layout**
- Define component skeleton
- Props and default values

**Step 2: Styling/Design System**
- Apply Tailwind tokens
- Use design system colors, spacing, typography

**Step 3: Refinement/UX**
- Micro-interactions (hover, focus, active)
- Animations (60fps)
- Dark mode variant
- Accessibility testing

---

## IMPLEMENTATION NOTES

### CSS Architecture (Tailwind v4.1)

**Full Tailwind v4.1 config with NEW features:**

```js
// tailwind.config.js
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B6B',
        'primary-dark': '#E55555',
        'primary-light': '#FF8A8A',
        
        secondary: '#FFB4A2',
        'secondary-dark': '#FFA08E',
        'secondary-light': '#FFC9BC',
        
        surface: '#FFF0EC',
        'surface-low': '#FFF5F2',
        'surface-container': '#FFFBFA',
        'surface-high': '#FFE8E0',
        'surface-highest': '#FFD9CF',
        
        'text-dark': '#2D1B1B',
        'text-medium': '#5C4447',
        'text-light': '#8B7073',
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        12: '48px',
        16: '64px',
      },
      fontFamily: {
        serif: ['Noto Serif', 'serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      backdropBlur: {
        sm: '4px',
        md: '10px',
        lg: '16px',
      },
      // ✨ Tailwind v4.1 NEW: Text shadows for editorial depth
      textShadow: {
        sm: '1px 1px 2px rgba(45, 27, 27, 0.15)',
        DEFAULT: '2px 2px 4px rgba(45, 27, 27, 0.15)',
        md: '3px 3px 6px rgba(45, 27, 27, 0.2)',
        lg: '4px 4px 8px rgba(45, 27, 27, 0.25)',
      },
      // ✨ Tailwind v4.1 NEW: Mask utilities (built-in, use with utilities)
      // Use: mask-t-from-50%, mask-radial-from-30%, mask-b-to-transparent, etc.
      // For image fades, vignettes, gradients
    },
  },
}
```

**Install Tailwind v4.1 + shadcn/ui + Storybook:**

```bash
# Initialize Next.js with Tailwind v4.1
npx create-next-app@latest --typescript --tailwind

# Add shadcn/ui
npx shadcn-ui@latest init

# Add Storybook for component development
npx sb@latest init
```

**Tailwind v4.1 Key Features Used:**

✨ **Text Shadows** — `text-shadow-sm`, `text-shadow-md`, `text-shadow-lg` for editorial typography  
✨ **Mask Utilities** — `mask-t-from-50%`, `mask-radial-*`, `mask-b-to-transparent` for image fades  
✨ **Drop Shadow Colors** — `drop-shadow-primary/40` for cohesive shadows (v4.1)  
✨ **Pointer-Coarse** — `pointer-coarse:p-4` for larger touch targets on mobile  
✨ **User-Valid/Invalid** — `user-valid:border-green` only after user interaction (v4.1)  
✨ **Safe Alignment** — `justify-center-safe` prevents overflow on small screens (v4.1)  
✨ **Improved Browser Support** — Fallbacks for older Safari, Firefox (v4.1)

### Component File Structure

```
components/
├── ui/                    # shadcn/ui customized
├── Button.jsx             # Custom variants
├── Card.jsx
├── MemoryCard.jsx         # Domain-specific
├── Modal.jsx
├── TabBar.jsx
└── ... (others)

.storybook/               # Storybook config
components/**/*.stories.jsx # One story per component
```

### QA Checklist

- [ ] No solid 1px borders (use color shifts or ghost borders only)
- [ ] All text uses warm black (#2D1B1B), never #000000
- [ ] Color contrast passes WCAG AA (4.5:1 minimum)
- [ ] Dark mode tested and looks cohesive
- [ ] Responsive tested at all breakpoints (320px, 768px, 1440px+)
- [ ] Animations smooth (60fps, no jank)
- [ ] Typography hierarchy clear (serif for hierarchy, sans for clarity)
- [ ] Spacing generous (use upper tiers: 6, 8, 10)
- [ ] Focus states visible (outline or ring)
- [ ] No hardcoded colors (all Tailwind tokens)
- [ ] Glassmorphism applied correctly (16px blur, proper opacity)
- [ ] Accessibility audit passed (axe DevTools)

---

**This Design System is the foundation. Every component must follow these principles.**

Next: Component Library building using Storybook → Full screen composition → Development
