# Cherish V2 — Component Library Roadmap

**Purpose:** Build isolated, reusable components using Storybook before assembling full screens.

**Approach:** Structured Iteration (Layout → Styling → Refinement) for each component.

**Using Tailwind CSS v4.1:** All components will leverage v4.1 features including text shadows, mask utilities, colored drop shadows, pointer-coarse variants, and user-valid/invalid for smart form validation.

---

## COMPONENT LIBRARY STRUCTURE

```
components/
├── ui/                    # shadcn/ui customized components
│   ├── button.jsx
│   ├── card.jsx
│   ├── input.jsx
│   ├── dialog.jsx
│   ├── tabs.jsx
│   └── ...
├── Button.jsx             # Custom variants on top of shadcn
├── Card.jsx
├── MemoryCard.jsx         # Domain-specific components
├── Modal.jsx
├── TabBar.jsx
├── Sidebar.jsx
├── Toast.jsx
├── ReminderCard.jsx
├── PersonProfileHeader.jsx
├── QuickCaptureTabs.jsx
└── ... (other domain components)

.storybook/               # Storybook configuration
├── main.ts
├── preview.ts
└── tailwind.config.js

components/**/*.stories.jsx  # One story per component
```

---

## PHASE 1: FOUNDATION COMPONENTS (Week 1)

**Goal:** Build core reusable components all other components depend on.

### 1.1 Button Component

**What to build:**
- Variants: primary (coral), secondary (peach), ghost (outline), disabled
- Sizes: sm (small), base (default), lg (large, full-width), fab (floating action)
- States: default, hover, focus, active, disabled, loading
- With/without icons
- Dark mode variant

**Iteration:**

*Step 1: Structure*
```jsx
// Storybook story - just the skeleton
<button className="...">
  {children}
</button>
```

*Step 2: Styling (Using Tailwind v4.1)*
```jsx
// Add Tailwind classes + v4.1 features (text-shadow, drop-shadow-color)
className={cn(
  'px-4 py-3 rounded-xl font-sans font-semibold transition-all',
  // ✨ v4.1: Text shadow for depth
  'text-shadow-sm text-shadow-black/20',
  // Variants with gradient (v4.1) + colored drop shadow (v4.1)
  variant === 'primary' && [
    'bg-gradient-to-br from-primary to-secondary text-white',
    'hover:from-primary-dark hover:to-secondary-dark',
    'drop-shadow-lg drop-shadow-primary/40',
  ],
  variant === 'secondary' && 'bg-surface-high text-text-dark hover:bg-surface-highest',
  variant === 'ghost' && 'bg-transparent border-b-2 border-surface-tint text-primary hover:border-primary',
)}
```

*Step 3: Refinement*
```jsx
// Add micro-interactions, animations, accessibility
onMouseDown={() => setIsActive(true)}
onMouseUp={() => setIsActive(false)}
aria-label={ariaLabel}
// Add ripple effect, bounce animation
```

**Storybook stories:**
- Default (primary)
- Secondary
- Ghost
- Disabled
- Loading
- Small
- Large (full-width)
- FAB

**QA before moving to next component:**
- [ ] All variants render correctly
- [ ] Dark mode looks good
- [ ] Responsive on mobile + desktop
- [ ] Accessibility: keyboard nav, ARIA labels
- [ ] Color contrast (WCAG AA)
- [ ] Hover/focus states visible
- [ ] No hardcoded colors (all Tailwind tokens)

---

### 1.2 Card Component

**What to build:**
- Base card (glassmorphism effect)
- Interactive card (hover, click states)
- Card with accent border
- Card with shadow variants

**Iteration:**

*Step 1: Structure*
```jsx
<div className="bg-white rounded-12 p-4">
  {children}
</div>
```

*Step 2: Styling*
```jsx
// Add glassmorphism
className={cn(
  'bg-white/70 backdrop-blur-10',
  'border border-white/50',
  'rounded-12 shadow-lg',
)}
```

*Step 3: Refinement*
```jsx
// Add hover animation, accent variants
onHover={() => setIsHovered(true)}
className={cn(
  baseClasses,
  isHovered && 'shadow-2xl -translate-y-1',
  hasAccent && 'border-l-4 border-l-primary-coral',
)}
```

**Storybook stories:**
- Base card
- Interactive card (hover effect)
- With accent border
- Hovered state
- Dark mode

**QA:**
- [ ] Glassmorphism effect smooth
- [ ] Animations are 60fps
- [ ] Shadow depth works across light/dark
- [ ] Responsive (scales down on mobile)
- [ ] Click target is easily identifiable

---

### 1.3 Input Component

**What to build:**
- Text input (default, focus, disabled, error)
- Textarea
- Label
- Error message
- Helper text

**Iteration:**

*Step 1: Structure*
```jsx
<div>
  <label>{label}</label>
  <input type="text" />
  {error && <span className="error">{error}</span>}
</div>
```

*Step 2: Styling*
```jsx
// Use design system colors
className={cn(
  'px-4 py-3 rounded-8',
  'border-2 border-border',
  'font-body text-base',
  error && 'border-error bg-error/5',
)}
```

*Step 3: Refinement*
```jsx
// Add focus ring, animations
onFocus={() => setIsFocused(true)}
className={cn(
  baseClasses,
  isFocused && 'border-primary-coral ring-4 ring-primary-coral/10',
)}
```

**Storybook stories:**
- Default
- Focused
- Disabled
- With error
- With helper text
- Textarea variant
- Dark mode

**QA:**
- [ ] Focus ring is visible (WCAG)
- [ ] Error state clear
- [ ] Placeholder text readable
- [ ] Cursor is visible
- [ ] Mobile keyboard doesn't break layout

---

### 1.4 Chip/Tag Component

**What to build:**
- Chip (selected/unselected, clickable)
- Tag (read-only, removable)
- Chip variants (mood, occasion, custom)

**Iteration:**

*Step 1: Structure*
```jsx
<button className="...">
  {label}
  {removable && <X />}
</button>
```

*Step 2: Styling*
```jsx
// Use peach for unselected, coral for selected
className={cn(
  'px-3 py-1 rounded-20 text-sm',
  isSelected 
    ? 'bg-primary-coral text-white'
    : 'bg-secondary-peach text-text-dark'
)}
```

*Step 3: Refinement*
```jsx
// Add scale animation on select
onClick={() => setIsSelected(!isSelected)}
className={cn(
  baseClasses,
  isSelected && 'scale-105',
)}
```

**Storybook stories:**
- Unselected chip
- Selected chip
- Disabled chip
- With remove button (tag)
- Small variant
- Dark mode

**QA:**
- [ ] Selection state obvious
- [ ] Scale animation smooth
- [ ] Remove button functional
- [ ] Keyboard accessible (Space to toggle)

---

## PHASE 2: CONTAINER COMPONENTS (Week 2)

Once foundation components solid, build containers that compose them.

### 2.1 Modal Component

**What to build:**
- Modal backdrop with blur
- Header, body, footer sections
- Close button (X)
- Slide-up animation (mobile)
- Center animation (desktop)
- Focus trap (tab within modal only)

**Dependencies:** Button, Input (for forms inside)

**Storybook stories:**
- Basic modal
- Modal with form
- Modal with long content (scrollable)
- Modal on mobile (full-screen)
- Modal on desktop (centered)
- Dark mode

---

### 2.2 Tab Bar Component (Mobile Navigation)

**What to build:**
- Fixed bottom tab bar
- 3 tabs (Home, Person, Reminders)
- Active tab highlighted (coral)
- Badge for notifications (red dot)
- Safe area inset (iPhone notch)

**Dependencies:** None (button-like)

**Storybook stories:**
- Default state
- With active tab
- With notification badge
- Safe area variant (iPhone)
- Dark mode

---

### 2.3 Sidebar Component (Desktop Navigation)

**What to build:**
- Fixed left sidebar
- Logo
- Nav items with icons
- Active state highlight
- Scrollable if needed

**Dependencies:** None

**Storybook stories:**
- Default state
- With active nav item
- Hovered nav item
- Dark mode

---

### 2.4 Toast Component

**What to build:**
- Toast notification (success, error, info)
- Auto-dismiss (5s)
- Stack multiple toasts
- Dismiss button
- Position (top-right desktop, bottom mobile)

**Dependencies:** None

**Storybook stories:**
- Success toast
- Error toast
- Info toast
- With action button
- Multiple toasts (stacked)
- Mobile position
- Desktop position

---

## PHASE 3: DOMAIN-SPECIFIC COMPONENTS (Week 2-3)

### 3.1 Memory Card Component

**What to build:**
- Card showing memory preview
- Avatar + name + date
- Content preview (text or "▶️ Voice note")
- Tags
- Heart icon (like/unlike)
- Actions menu ([...])
- Swipe left gesture (mobile) → reveal actions

**Dependencies:** Card, Chip, Button

**Storybook stories:**
- Text memory
- Voice memory
- Photo memory
- With tags
- Liked state
- With actions menu
- Hovered state (reveal actions)
- Dark mode

---

### 3.2 Quick Capture Modal

**What to build:**
- Modal with 5 tabs (Text, Voice, Photo, Gift, Occasion)
- Tab switching UI
- Text input (Textarea)
- Voice recorder (Record button, timer, playback, transcription)
- Photo uploader (camera/gallery)
- Gift form (name, category, price)
- Occasion form (name, date, recurring, timing)
- Save button
- Draft save indicator

**Dependencies:** Modal, Input, Button, Chip

**Storybook stories:**
- Text tab
- Voice tab (recording state)
- Voice tab (playback state)
- Photo tab
- Gift tab
- Occasion tab
- All with save/cancel buttons
- Dark mode

---

### 3.3 Person Profile Header

**What to build:**
- Large hero photo
- Name
- Relationship duration
- Edit button
- Stats grid (memories, type, mood, last memory)

**Dependencies:** Button, Card

**Storybook stories:**
- Default
- With long name
- Mobile layout
- Desktop layout
- Dark mode

---

### 3.4 Reminder Card

**What to build:**
- Icon (🎂 🎁 📅)
- Title
- Date ("in 5 days", "Today")
- Status badge
- Actions (Edit, Mark Done, Snooze)
- Snooze menu (1d, 1w, custom)

**Dependencies:** Button, Badge

**Storybook stories:**
- Upcoming reminder
- Today reminder
- With actions menu
- Snooze menu open
- Dark mode

---

## STORYBOOK COMMANDS

```bash
# Install Storybook
npx sb@latest init

# Run Storybook locally
npm run storybook
# Opens http://localhost:6006

# Build static Storybook (for sharing)
npm run build-storybook

# Test components with axe accessibility audit
npm install --save-dev @storybook/addon-a11y
```

---

## COMPONENT TESTING CHECKLIST

Before moving component to "done", verify:

### Visual Testing
- [ ] Component renders on mobile viewport (320px)
- [ ] Component renders on tablet viewport (768px)
- [ ] Component renders on desktop viewport (1440px)
- [ ] Dark mode variant looks good
- [ ] All interactive states (hover, focus, active) visible
- [ ] Animations are smooth (no jank)

### Accessibility Testing
- [ ] WCAG AA color contrast (4.5:1 for text)
- [ ] Focus states visible (outline or ring)
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] ARIA labels present (if needed)
- [ ] axe DevTools audit passes

### Code Quality
- [ ] No hardcoded colors (all Tailwind tokens)
- [ ] No hardcoded spacing (all Tailwind scale)
- [ ] Component accepts all needed props
- [ ] Component documented in Storybook
- [ ] Component has story for each variant
- [ ] PropTypes or TypeScript types defined

---

## IMPLEMENTATION WORKFLOW

**For each component:**

1. **Create component file** in `/components`
2. **Create Storybook story** in `/components/ComponentName.stories.jsx`
3. **Iteration Step 1:** Build structure (HTML skeleton)
4. **Iteration Step 2:** Add styling (Tailwind classes)
5. **Iteration Step 3:** Add refinement (animations, states, a11y)
6. **QA:** Test all stories in Storybook, run axe audit
7. **Move to next component**

---

## TIMELINE

**Week 1 (Foundation):** Button, Card, Input, Chip  
**Week 2 (Containers):** Modal, TabBar, Sidebar, Toast  
**Week 2-3 (Domain):** MemoryCard, QuickCapture, ProfileHeader, ReminderCard  

**After Week 3:** Use components to build full screens (quick, consistent composition)

---

## WHY THIS APPROACH?

✅ **Less generic:** Focus on each component individually = more intentional design  
✅ **Reusable:** Build once, use everywhere  
✅ **Testable:** Isolated = easier to test  
✅ **Faster screens:** Compose screens FROM components, not from scratch  
✅ **Better QA:** Catch issues early, fix once, fixed everywhere  
✅ **Easier maintenance:** Update component, all screens using it update automatically  

---

**Start Week 1 Phase 1 as soon as Tailwind + shadcn/ui are set up.**
