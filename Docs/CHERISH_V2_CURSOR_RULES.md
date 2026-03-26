# Cherish V2 — Cursor Rules

**Purpose:** Instructions for AI-assisted development to maintain design consistency, code quality, and product vision.

**Use these rules in your Cursor config or `.cursorrules` file.**

---

## PROJECT OVERVIEW

**Product:** Cherish v2 - Relationship Memory Companion App  
**Platform:** Mobile-first PWA (Next.js), desktop responsive  
**Tech Stack:** Next.js (App Router) + Supabase + Tailwind CSS + shadcn/ui + Vercel + Resend + Claude API  
**Design Philosophy:** Editorial Intimacy + Component-Driven Development  
**Target User:** Someone in a romantic relationship who wants to remember and cherish moments with their partner

---

## CORE DESIGN PRINCIPLES (Non-Negotiable)

### 1. The "No-Line" Rule
- ❌ **NEVER use solid 1px borders** for sectioning or visual hierarchy
- ✅ Use color shifts (surface-container tiers) instead
- ✅ Only exception: 20% opacity "ghost borders" for accessibility (focus rings, form validation)
- ✅ List separators: Use spacing or alternating background colors, NEVER lines

### 2. Typography-First Hierarchy
- ✅ Hierarchy comes from font size, weight, and color — NOT from boxes
- ✅ Lead every screen with display typography (display-md or headline-lg in serif)
- ✅ Body text uses 1.6+ line-height for "journal" feel
- ✅ Never center-align more than 3 lines; use intentional left-alignment

### 3. Warm, Never Cold
- ❌ Never use pure black (#000000) — Always use #2D1B1B
- ✅ All colors should feel sun-drenched and organic
- ✅ Shadows are warm-tinted (#2D1B1B at 6% opacity), never grey
- ✅ Gradients use primary to secondary (coral to peach, 135°)

### 4. Generous Spacing
- ✅ Use spacing scale tiers 6, 8, 10 (24px, 32px, 40px) between major sections
- ✅ Hero sections: 16px left-padding minimum (asymmetry)
- ✅ Card padding: 20px minimum
- ✅ Body text line-height: 1.6+ for breathing room

### 5. Glassmorphism for Premium Feel
- ✅ Floating UI (modals, headers): 16px backdrop-blur on 80-95% opacity surface
- ✅ Buttons: Gradient primary → secondary (135°)
- ✅ Result: Tactile, elevated, premium without heaviness

### 6. Component Reusability
- ✅ Build components first (Storybook), then compose screens
- ✅ Each component: Button, Card, Input, etc. — has multiple variants
- ✅ Props-based customization, never copy-paste styling
- ✅ All components tested in light + dark mode

### 7. Intentional Asymmetry
- ✅ Break the grid — overlap elements, rotate 3°, use off-center padding
- ✅ Reflection cards: One at 3°, one behind at -2° with 20px offset
- ✅ Editorial layouts with breathing room, not rigid grids

### 8. No Pure Borders, Shadows, or Greys
- ❌ No `border: 1px solid #ccc` or `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)`
- ✅ Borders: Ghost borders or color shifts only
- ✅ Shadows: Warm, tinted at specific opacity (0 8px 24px rgba(45, 27, 27, 0.06))
- ✅ Greys: Neutral-100 to Neutral-900 in design system (warm tones, not cold)

---

## CODE STYLE & STRUCTURE

### File Organization

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group
│   │   └── login/page.jsx
│   ├── (main)/                   # Main app group
│   │   ├── home/page.jsx
│   │   ├── person/page.jsx
│   │   ├── reminders/page.jsx
│   │   └── layout.jsx
│   ├── api/                      # API routes
│   ├── layout.jsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn/ui customized
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   └── ...
│   ├── Button.jsx                # Custom component wrapper/variants
│   ├── Card.jsx
│   ├── MemoryCard.jsx            # Domain-specific components
│   ├── Modal.jsx
│   ├── TabBar.jsx
│   ├── QuickCaptureModal.jsx
│   ├── PersonProfileHeader.jsx
│   ├── ReminderCard.jsx
│   └── ...
├── lib/
│   ├── supabase.ts               # Supabase client
│   ├── claude.ts                 # Claude API integration
│   ├── utils.ts                  # Utilities (cn, formatting, etc.)
│   └── constants.ts              # App constants
├── hooks/                        # Custom React hooks
│   ├── useMemories.ts
│   ├── useReminders.ts
│   └── ...
├── types/                        # TypeScript types
│   ├── index.ts
│   ├── memory.ts
│   ├── person.ts
│   └── ...
├── styles/
│   ├── globals.css               # Global Tailwind setup
│   └── tailwind.config.js        # Tailwind configuration
└── public/                       # Static assets
```

### Component File Template

```jsx
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ComponentNameProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
  // ... other props
}

export function ComponentName({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: ComponentNameProps) {
  return (
    <div
      className={cn(
        // Base styles
        'rounded-xl transition-all duration-200',
        // Variant styles
        variant === 'primary' && 'bg-primary text-white',
        variant === 'secondary' && 'bg-surface-container-high text-text-dark',
        // Size styles
        size === 'sm' && 'px-3 py-2 text-sm',
        size === 'md' && 'px-4 py-3 text-base',
        size === 'lg' && 'px-6 py-4 text-lg',
        // Custom className
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
```

### Naming Conventions

- **Components:** PascalCase (Button, MemoryCard, QuickCaptureModal)
- **Files:** kebab-case for utilities/hooks (use-memories.ts, api-client.ts)
- **CSS Classes:** Use Tailwind utilities, no custom class names (exception: component wrappers)
- **Variables:** camelCase for functions/variables, UPPER_CASE for constants
- **Types:** PascalCase with `Props` suffix (ButtonProps, MemoryCardProps)

---

## TAILWIND CSS V4.1 SPECIFIC PATTERNS

### Text Shadows (Editorial Depth)

Use `text-shadow-*` utilities for heading depth without images:

```jsx
// Hero title with shadow for visual hierarchy
<h1 className="text-4xl text-shadow-md text-shadow-black/20 font-serif">
  Cherish moments together
</h1>

// Embossed button effect
<button className="text-shadow-2xs text-shadow-white/50">
  See Pricing
</button>

// Available: text-shadow-sm, text-shadow-md, text-shadow-lg
// Combine with opacity: text-shadow-lg/50, text-shadow-lg/20
```

### Mask Utilities (Fades & Vignettes)

Use `mask-*` utilities for image fades:

```jsx
// Fade at top (linear mask)
<img src="/memory.jpg" className="mask-t-from-50% mask-t-to-transparent object-cover" />

// Vignette (radial mask)
<img src="/partner.jpg" className="rounded-full mask-radial-from-transparent mask-radial-from-30%" />

// Fade from bottom
<div className="mask-b-from-50% mask-b-to-transparent bg-gradient-to-b from-primary to-secondary">
  Content
</div>
```

### Colored Drop Shadows (v4.1)

```jsx
// Shadow matches element color
<button className="drop-shadow-lg drop-shadow-primary/40">Add Memory</button>
<svg className="drop-shadow-md drop-shadow-secondary/50"><path /></svg>
```

### Pointer-Coarse (Touch Optimization)

```jsx
// Larger on touch, smaller on desktop
<button className="p-2 pointer-coarse:p-4 text-sm pointer-coarse:text-base">
  Record
</button>
```

### User-Valid/Invalid (Smart Validation)

```jsx
// Red border only AFTER user interaction
<input
  required
  className="border user-valid:border-green-500 user-invalid:border-error"
  placeholder="What happened?"
/>
```

### Safe Alignment (Responsive Centering)

```jsx
// Centers but shifts left if overflow (no container query needed)
<div className="flex justify-center-safe items-center">
  <Dialog />
</div>
```

---

## TAILWIND CSS & DESIGN TOKENS

### Tailwind Configuration

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        // Primary (Romantic, Energetic)
        primary: '#FF6B6B',
        'primary-dark': '#E55555',
        'primary-light': '#FF8A8A',
        
        // Secondary (Warmth, Softness)
        secondary: '#FFB4A2',
        'secondary-dark': '#FFA08E',
        'secondary-light': '#FFC9BC',
        
        // Surface Hierarchy (Critical)
        surface: '#FFF0EC',
        'surface-low': '#FFF5F2',
        'surface-container': '#FFFBFA',
        'surface-high': '#FFE8E0',
        'surface-highest': '#FFD9CF',
        
        // Text (Warm, Never Pure Black)
        'text-dark': '#2D1B1B',
        'text-medium': '#5C4447',
        'text-light': '#8B7073',
        'text-variant': '#A89A93',
      },
      fontFamily: {
        serif: ['Noto Serif', 'serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-lg': ['2.5rem', { lineHeight: '3rem' }],
        'display-md': ['2rem', { lineHeight: '2.5rem' }],
        'headline-lg': ['1.75rem', { lineHeight: '2.25rem' }],
        'headline-md': ['1.5rem', { lineHeight: '2rem' }],
        'headline-sm': ['1.25rem', { lineHeight: '1.75rem' }],
        'title-lg': ['1.125rem', { lineHeight: '1.5rem' }],
        'title-md': ['1rem', { lineHeight: '1.5rem' }],
        'title-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'body-lg': ['1rem', { lineHeight: '1.625rem' }],
        'body-md': ['0.9375rem', { lineHeight: '1.5rem' }],
        'body-sm': ['0.875rem', { lineHeight: '1.25rem' }],
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
    },
  },
}
```

### Using Tailwind v4.1 in Components

```jsx
// ✅ DO THIS - Use Tailwind v4.1 utilities
<button className="bg-gradient-to-br from-primary to-secondary text-white px-4 py-3 rounded-xl text-shadow-sm text-shadow-black/20 drop-shadow-lg drop-shadow-primary/40 hover:from-primary-dark hover:to-secondary-dark transition-all">
  Add Memory
</button>

// ❌ DON'T DO THIS
<button style={{ backgroundColor: '#FF6B6B', padding: '12px 16px' }}>
  Add Memory
</button>

// ✅ For complex styling, use cn() utility with v4.1 features
<div className={cn(
  'px-4 py-3 rounded-xl transition-all',
  // Text shadow for depth (v4.1)
  'text-shadow-sm text-shadow-black/15',
  // Variants
  variant === 'primary' && [
    'bg-gradient-to-br from-primary to-secondary text-white',
    'drop-shadow-lg drop-shadow-primary/40',
    'hover:from-primary-dark hover:to-secondary-dark',
  ],
  variant === 'secondary' && 'bg-surface-high text-text-dark hover:bg-surface-highest',
)}>
  {children}
</div>

// ✅ Mask utilities for image fades (v4.1)
<img src="/memory.jpg" className="mask-t-from-50% mask-t-to-transparent object-cover rounded-lg" />

// ✅ Pointer-coarse for touch devices (v4.1)
<button className="p-2 pointer-coarse:p-4 text-sm pointer-coarse:text-base">
  {children}
</button>

// ✅ Form validation without page-load red (v4.1)
<input
  required
  className="border border-gray-300 user-valid:border-green-500 user-invalid:border-error"
  placeholder="What happened?"
/>
```

---

## COMPONENT PATTERNS

### All Components Must Have

1. **Variants** — At least 2-3 visual states (primary, secondary, disabled)
2. **Sizes** — sm, md, lg options
3. **States** — Default, hover, focus, active, disabled
4. **Dark Mode** — Test in both light and dark
5. **Accessibility** — ARIA labels, focus rings, keyboard nav
6. **Responsiveness** — Works on 320px, 768px, 1440px
7. **TypeScript** — Full type safety, no `any`

### Button Component Example

```jsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base
        'font-sans font-semibold rounded-lg transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        
        // Size
        size === 'sm' && 'px-3 py-2 text-sm',
        size === 'md' && 'px-4 py-3 text-base',
        size === 'lg' && 'px-6 py-4 text-lg w-full',
        
        // Variant
        variant === 'primary' && [
          'bg-gradient-to-br from-primary to-secondary text-white',
          'hover:shadow-lg hover:-translate-y-0.5',
          'active:translate-y-0',
        ],
        variant === 'secondary' && [
          'bg-surface-high text-text-dark',
          'hover:bg-surface-highest',
        ],
        variant === 'tertiary' && [
          'bg-transparent text-primary',
          'border-b-2 border-surface-tint',
          'hover:border-primary',
        ],
        
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? '...' : children}
    </button>
  )
}
```

### Card Component Example

```jsx
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  accentBorder?: boolean
}

export function Card({
  interactive = false,
  accentBorder = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        // Base
        'bg-surface-high rounded-xl p-5',
        'shadow-ambient transition-all duration-200',
        accentBorder && 'border-l-4 border-l-primary',
        
        // Interactive
        interactive && [
          'cursor-pointer',
          'hover:bg-surface-highest hover:shadow-lg hover:-translate-y-1',
          'active:translate-y-0',
        ],
        
        className,
      )}
      {...props}
    />
  )
}
```

---

## FORM PATTERNS

### Input Component

```jsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({
  label,
  error,
  helperText,
  className,
  ...props
}: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-text-medium uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full bg-surface-container px-4 py-3 border-b-2 border-primary',
          'font-sans text-base focus:outline-none',
          'focus:ring-4 focus:ring-primary/10 focus:bg-white',
          'placeholder:text-text-light',
          'disabled:bg-surface-low disabled:cursor-not-allowed',
          error && 'border-error focus:ring-error/10',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-error mt-1">{error}</p>}
      {helperText && <p className="text-xs text-text-light mt-1">{helperText}</p>}
    </div>
  )
}
```

---

## API & DATA PATTERNS

### Supabase Client

```ts
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
```

### Custom Hooks

```ts
// hooks/useMemories.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Memory } from '@/types'

export function useMemories(partnerId: string) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('memories')
          .select('*')
          .eq('partner_id', partnerId)
          .order('created_at', { ascending: false })

        if (supabaseError) throw supabaseError
        setMemories(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchMemories()
  }, [partnerId])

  return { memories, loading, error }
}
```

### API Routes

```ts
// app/api/memories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('memories')
      .insert([body])
      .select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
```

---

## STATE MANAGEMENT

### Use React Hooks First

```jsx
// ✅ Start with useState/useContext
const [memories, setMemories] = useState<Memory[]>([])

// ✅ Move to custom hooks
const { memories, loading } = useMemories(partnerId)

// ✅ Only add Zustand/Jotai if needed at scale
// For MVP, hooks are sufficient
```

### Context for Global State

```tsx
// contexts/AuthContext.tsx
import { createContext, useContext } from 'react'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Implementation
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

---

## RESPONSIVE DESIGN

### Mobile-First Approach

```jsx
// ✅ DO THIS
<div className="text-base md:text-lg lg:text-xl">
  Text that scales with breakpoints
</div>

// ❌ DON'T DO THIS
<div className="hidden lg:block">
  Only visible on large screens (bad for mobile)
</div>

// ✅ Mobile defaults, then override
<div className="block lg:hidden">Mobile version</div>
<div className="hidden lg:block">Desktop version</div>
```

### Breakpoints

- Mobile: 0px - 639px (default)
- Tablet: 640px - 767px (md)
- Desktop: 768px+ (lg)
- Large: 1024px+ (xl)
- Extra Large: 1440px+ (2xl)

---

## ACCESSIBILITY REQUIREMENTS

### Must Have

1. **Color Contrast:** WCAG AA minimum (4.5:1 for text)
2. **Focus States:** Every interactive element has visible outline
3. **ARIA Labels:** Buttons, icons, form fields
4. **Keyboard Navigation:** Tab order, Enter/Space activation, Escape to close
5. **Screen Reader:** Semantic HTML, no aria-hidden on important content
6. **No Color-Only Indicators:** Use icons, text, or multiple indicators

### Implementation

```jsx
// ✅ Accessible Button
<button
  className="focus:outline-2 focus:outline-offset-2 focus:outline-primary"
  aria-label="Add new memory"
  onClick={handleClick}
>
  +
</button>

// ✅ Accessible Link
<a
  href="/memories/123"
  className="text-primary underline focus:ring-2 focus:ring-offset-2 focus:ring-primary"
  aria-label="View memory from 5 days ago"
>
  View Memory
</a>

// ✅ Accessible Form
<label htmlFor="memory-input" className="block text-sm font-semibold mb-2">
  What happened?
</label>
<textarea
  id="memory-input"
  aria-describedby="memory-helper"
  className="focus:ring-2 focus:ring-primary"
  placeholder="Type here..."
/>
<p id="memory-helper" className="text-xs text-text-light mt-1">
  You can also add photos or voice notes
</p>
```

---

## PERFORMANCE GUIDELINES

### Bundle Size

- Keep component files small (<300 lines)
- Use dynamic imports for heavy components
- Lazy load images with `next/image`
- Code-split route bundles automatically

### Rendering

```jsx
// ✅ Memoize expensive components
const MemoryCard = React.memo(({ memory }: { memory: Memory }) => {
  // Component
})

// ✅ Use useCallback for event handlers
const handleLike = useCallback(() => {
  // Handler
}, [dependency])

// ✅ Virtualize long lists
import { FixedSizeList } from 'react-window'
```

### Images

```jsx
// ✅ Use next/image
import Image from 'next/image'

<Image
  src="/memories/photo.jpg"
  alt="Memory from our date"
  width={400}
  height={300}
  priority={false}
  placeholder="blur"
/>

// ❌ Don't use <img> tag
<img src="/memories/photo.jpg" alt="..." />
```

---

## ERROR HANDLING

### API Calls

```ts
// ✅ Always handle errors
try {
  const data = await fetchMemories(partnerId)
  setMemories(data)
} catch (error) {
  setError(error instanceof Error ? error.message : 'Failed to load')
  toast.error('Could not load memories')
}

// ❌ Don't ignore errors
const data = await fetchMemories(partnerId) // What if it fails?
```

### Form Validation

```jsx
// ✅ Validate before submit
const [errors, setErrors] = useState<Record<string, string>>({})

const handleSubmit = async (formData: FormData) => {
  const newErrors: Record<string, string> = {}
  
  if (!formData.content.trim()) {
    newErrors.content = 'Memory cannot be empty'
  }
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors)
    return
  }
  
  // Submit...
}
```

---

## GIT COMMIT MESSAGES

Format: `type(scope): description`

```
feat(memories): add voice note recording
fix(ui): correct button padding in dark mode
refactor(components): simplify card styling
docs(design-system): update color palette
test(memories): add useMemories hook tests
chore(deps): upgrade tailwind to 3.4
```

---

## TESTING

### Unit Tests (jest + React Testing Library)

```tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    screen.getByRole('button').click()
    expect(handleClick).toHaveBeenCalled()
  })

  it('is accessible with keyboard', () => {
    render(<Button>Click</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveFocus() // After tab
  })
})
```

### Component Testing (Storybook)

```tsx
// components/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Add Memory',
  },
}

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Saving...',
  },
}
```

---

## DOCUMENTATION

### README for Components

```md
# Button Component

Reusable button with multiple variants and sizes.

## Usage

\`\`\`jsx
import { Button } from '@/components/Button'

<Button variant="primary" size="md">
  Click me
</Button>
\`\`\`

## Props

- `variant`: 'primary' | 'secondary' | 'tertiary' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `disabled`: boolean
- `className`: string (optional)

## Variants

- **Primary:** Gradient coral to peach, white text
- **Secondary:** Surface container background, dark text
- **Tertiary:** Text only with bottom border

## Accessibility

- Keyboard navigation: Enter/Space to activate
- Focus ring: Visible outline in primary color
- ARIA labels: Added where needed
```

---

## DO's AND DON'Ts

### DO

✅ Use Tailwind utilities for all styling  
✅ Build component variants with props  
✅ Test components in light + dark mode  
✅ Use TypeScript for type safety  
✅ Keep components under 300 lines  
✅ Use semantic HTML (button, input, label, etc.)  
✅ Document component props with JSDoc  
✅ Test accessibility with axe DevTools  
✅ Use warm colors (#2D1B1B, never #000000)  
✅ Lead with typography for hierarchy  

### DON'T

❌ Use inline styles or CSS modules (Tailwind only)  
❌ Create hardcoded colors (use Tailwind tokens)  
❌ Use solid 1px borders (color shifts or ghost borders)  
❌ Copy-paste component code (use variants instead)  
❌ Skip dark mode testing  
❌ Ignore accessibility (WCAG AA minimum)  
❌ Use setTimeout/setInterval (use useEffect)  
❌ Fetch data without loading/error states  
❌ Ship untyped JavaScript (always use TypeScript)  
❌ Use grey shadows (warm, tinted only)  

---

## CLAUDE/AI DEVELOPMENT GUIDELINES

### When Asking Claude to Build

**Structure your request:**

```
1. What to build (Button, MemoryCard, etc.)
2. What variants/props it should have
3. How it should look (reference design system)
4. Accessibility requirements
5. Where it fits in the app
```

**Example:**
```
Build a MemoryCard component with:
- Prop: memory object (type, content, tags, date)
- Variants: text, voice, photo
- States: liked, unliked
- Actions: heart button (like), menu (more actions)
- Must work mobile (320px) + desktop (1440px)
- Glassmorphism effect, rounded-xl
- Dark mode support
- Keyboard accessible
- Reference: DESIGN_SYSTEM.md components section
```

### Structured Iteration

```
Step 1: Structure/Layout
  → Build HTML skeleton, define props, TypeScript types

Step 2: Styling/Design System
  → Add Tailwind classes, use design tokens, test light + dark

Step 3: Refinement/UX
  → Add interactions, animations, accessibility, responsiveness
```

### What NOT to Ask Claude

❌ "Build the whole home screen" (too big, too many decisions)  
❌ "Make it look good" (vague, needs design spec)  
❌ "Use whatever CSS you want" (must use Tailwind)  
✅ "Build Button component with primary/secondary/tertiary variants"  
✅ "Add smooth fade animation to MemoryCard on mount"  
✅ "Refactor Card to use ghost border instead of solid line"  

---

## REVIEW CHECKLIST BEFORE COMMIT

- [ ] Code follows Tailwind + component patterns
- [ ] No hardcoded colors or spacing (all tokens)
- [ ] TypeScript types complete (no `any`)
- [ ] Component tested in light + dark mode
- [ ] Responsive tested (320px, 768px, 1440px)
- [ ] Accessibility: focus states, ARIA labels, keyboard nav
- [ ] No console errors or warnings
- [ ] Naming conventions followed (PascalCase, camelCase, etc.)
- [ ] Component reusable (not one-off styles)
- [ ] Comments added for complex logic
- [ ] Git commit message formatted correctly
- [ ] Storybook story created (if applicable)

---

**These rules are your north star. Use them religiously.**

For questions, refer to:
- **PRODUCT_SPEC.md** — What to build
- **DESIGN_SYSTEM.md** — How it should look
- **COMPONENT_ROADMAP.md** — Build sequence
