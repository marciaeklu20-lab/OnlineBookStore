# BOOKSTORE PRD — PART 4: DESIGN SYSTEM

**Document Version:** 1.0  
**Date:** April 8, 2026  
**Section:** UI Components, Tokens & Design Language

---

## 1. DESIGN SYSTEM OVERVIEW

**System Reference:** Premium dark mode (inspired by Denta dental app)  
**Framework Stack:** React + Next.js  
**CSS Framework:** Tailwind CSS + ShadCN/UI  
**Design Tools:** Figma (with Tailwind plugin)  
**Component Library:** ShadCN/UI (headless, deeply customizable)

### Design Philosophy
- **Dark-first aesthetic** (premium, modern feel)
- **Card-based architecture** (modular, organized)
- **Clear hierarchy** (typography-driven design)
- **Micro-interactions** (smooth, purposeful animations)
- **Accessibility-first** (WCAG 2.1 AA compliance)

---

## 2. DESIGN TOKENS

### 2.1 Color System

#### Primary Brand Colors

| Purpose | Color Name | Hex | RGB | Usage |
|---------|-----------|-----|-----|-------|
| **Primary Accent** | Orange | #FF6F00 | 255, 111, 0 | Buttons, CTAs, highlights |
| **Accent Warm** | Warm Orange | #FF8A65 | 255, 138, 101 | Price tags, secondary accents |
| **Accent Light** | Light Orange | #FFB74D | 255, 183, 77 | Hover states, tertiary accents |

#### Background Colors

| Purpose | Hex | RGB | Usage |
|---------|-----|-----|-------|
| **Brand 950** (Darkest) | #0F0F0F | 15, 15, 15 | Page background |
| **Brand 900** | #1A1A1A | 26, 26, 26 | Card surfaces, dialogs |
| **Brand 800** | #2D2D2D | 45, 45, 45 | Hover states |
| **Brand 700** | #404040 | 64, 64, 64 | Subtle backgrounds |

#### Text Colors

| Context | Hex | RGB | Opacity | Usage |
|---------|-----|-----|---------|-------|
| **Primary Text** | #FFFFFF | 255, 255, 255 | 100% | Headlines, main content |
| **Secondary Text** | #B0BEC5 | 176, 190, 197 | 70% | Descriptions |
| **Tertiary Text** | #78909C | 120, 144, 156 | 60% | Meta info, labels |
| **Disabled Text** | #495057 | 73, 80, 87 | 50% | Disabled state |

#### Semantic Colors

| State | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Success** | #10B981 | 16, 185, 129 | Available, completed |
| **Warning** | #F59E0B | 245, 158, 11 | Pending, attention |
| **Error** | #EF4444 | 239, 68, 68 | Errors, cancellations |
| **Info** | #3B82F6 | 59, 130, 246 | Information, hints |

#### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          950: '#0F0F0F',
          900: '#1A1A1A',
          800: '#2D2D2D',
          700: '#404040',
          accent: '#FF6F00',
          'accent-warm': '#FF8A65',
          'accent-light': '#FFB74D',
        },
        semantic: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        }
      }
    }
  }
}
```

---

### 2.2 Typography System

#### Font Stack
```css
/* Primary Font (Headlines) */
font-family: 'Inter', 'SF Pro Display', 'Segoe UI', system-ui, -apple-system, sans-serif;

/* Secondary Font (Body) */
font-family: 'Inter', 'SF Pro Display', 'Segoe UI', system-ui, -apple-system, sans-serif;
```

#### Scale & Usage

| Level | Size | Weight | Line-Height | Letter-Spacing | Usage |
|-------|------|--------|-------------|-----------------|-------|
| **H1** | 48px | 700 | 1.2 | -0.02em | Page titles, hero headlines |
| **H2** | 36px | 600 | 1.3 | -0.01em | Section titles |
| **H3** | 28px | 600 | 1.35 | 0 | Subsection titles |
| **H4** | 20px | 600 | 1.4 | 0 | Card titles |
| **H5** | 18px | 600 | 1.4 | 0 | Component headers |
| **Body Large** | 16px | 400 | 1.6 | 0 | Primary body text |
| **Body** | 14px | 400 | 1.6 | 0 | Standard body text |
| **Body Small** | 13px | 400 | 1.5 | 0 | Secondary text |
| **Label** | 12px | 500 | 1.4 | 0.02em | Badges, filters, metadata |
| **Micro** | 11px | 500 | 1.3 | 0.03em | Timestamps, counts |

#### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontSize: {
        'h1': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['36px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3': ['28px', { lineHeight: '1.35', fontWeight: '600' }],
        'h4': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.6' }],
        'body': ['14px', { lineHeight: '1.6' }],
        'body-sm': ['13px', { lineHeight: '1.5' }],
        'label': ['12px', { lineHeight: '1.4', letterSpacing: '0.02em', fontWeight: '500' }],
      }
    }
  }
}
```

---

### 2.3 Spacing System

**Base Unit:** 8px grid

| Scale | Value | Usage |
|-------|-------|-------|
| **xs** | 4px | Micro spacing (icons, small gaps) |
| **sm** | 8px | Padding in compact components |
| **md** | 16px | Standard padding (cards, buttons) |
| **lg** | 24px | Section padding, gaps |
| **xl** | 32px | Large section gaps |
| **2xl** | 48px | Page-level spacing, hero sections |
| **3xl** | 64px | Major section separation |

#### Component Spacing Examples

| Component | Padding | Gap |
|-----------|---------|-----|
| **Hero Card** | 48px | – |
| **Book Card** | 24px | 16px |
| **Button** | 12px horizontal, 8px vertical | – |
| **Filter Pill** | 8px horizontal, 6px vertical | 8px between |
| **Page Container** | 24px (mobile), 48px (desktop) | – |

---

### 2.4 Radius System

| Scale | Value | Usage |
|-------|-------|-------|
| **none** | 0px | Specific cases |
| **xs** | 4px | Minor elements, toggles |
| **sm** | 8px | Components, inputs |
| **md** | 12px | Standard (buttons, inputs, cards) |
| **lg** | 16px | Major cards, dialogs |
| **xl** | 24px | Large hero sections |
| **full** | 9999px | Pills, badges, avatars, circles |

---

### 2.5 Shadow System (Elevation)

```css
/* Shadow Scales */
shadow-xs: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
shadow-sm: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
shadow-md: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
shadow-lg: 0 15px 25px rgba(0, 0, 0, 0.15), 0 15px 15px rgba(0, 0, 20);
shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.2);

/* Usage */
shadow-hover: shadow-lg (on card hover)
shadow-active: shadow-xl (on button click)
shadow-dialog: shadow-lg (modal/dialog)
```

---

### 2.6 Animation Tokens

| Property | Value | Usage |
|----------|-------|-------|
| **Duration Fast** | 150ms | Quick state changes (hover, focus) |
| **Duration Base** | 300ms | Standard transitions |
| **Duration Slow** | 500ms | Page transitions, complex animations |
| **Easing In-Out** | cubic-bezier(0.4, 0, 0.2, 1) | Smooth, natural motion |
| **Easing Focus** | cubic-bezier(0.25, 0.46, 0.45, 0.94) | Focused interactions |

---

## 3. COMPONENT LIBRARY (SHADCN/UI BASED)

### 3.1 Button Component

**Variants:**
- `primary` (orange background, white text)
- `secondary` (dark gray background, white text)
- `outline` (transparent, border)
- `ghost` (no background, hover highlight)

**Sizes:**
- `sm` (32px height, 12px padding)
- `md` (40px height, 16px padding)
- `lg` (48px height, 20px padding)

**States:**
- Default (interactive)
- Hover (opacity +10%, shadow increase)
- Active (pressed animation)
- Disabled (opacity 50%, cursor not-allowed)
- Loading (spinner, disabled state)

**Example:**
```jsx
<Button variant="primary" size="md" className="gap-2">
  <ShoppingCart className="w-4 h-4" />
  Add to Cart
</Button>
```

---

### 3.2 Card Component

**Structure:**
- `CardHeader` (top section, usually title)
- `CardContent` (main content area)
- `CardFooter` (bottom section)

**Variants:**
- `default` (standard dark gray)
- `hover` (interactive, interactive cursor)
- `elevated` (shadow-lg)
- `outline` (border accent)

**Example:**
```jsx
<Card className="bg-brand-900 border-brand-700">
  <CardHeader>
    <h3 className="text-h5">Book Title</h3>
  </CardHeader>
  <CardContent>
    <p className="text-body-sm text-gray-400">Description</p>
  </CardContent>
  <CardFooter>
    <Badge>New</Badge>
  </CardFooter>
</Card>
```

---

### 3.3 Button Group / Pill Filter

**Structure:**
- Horizontal set of pills
- Selectable via click or keyboard
- Active state highlights

**States:**
- Default (border, white text)
- Active (orange background, white text)
- Disabled (gray, no interaction)

**Example:**
```jsx
<div className="flex gap-2">
  <Button variant="pill" className="border border-gray-500">Fantasy</Button>
  <Button variant="pill" className="bg-orange-600">Sci-Fi</Button>
  <Button variant="pill" className="border border-gray-500">Mystery</Button>
</div>
```

---

### 3.4 Input Components

**Variants:**
- Text input
- Textarea
- Select dropdown
- Checkbox
- Radio group
- Switch toggle

**States:**
- Default (gray border)
- Focus (orange border, 2px outline)
- Disabled (gray, opacity 50%)
- Error (red border + error message)

**Example:**
```jsx
<Input
  placeholder="Search books..."
  className="bg-brand-800 border-brand-700 text-white"
/>
```

---

### 3.5 Modal / Dialog

**Structure:**
- Overlay (dark, semi-transparent)
- Dialog container (dark gray background)
- Header (title + close button)
- Body (content)
- Footer (actions)

**Animation:**
- Fade in (150ms)
- Scale (300ms)

**Example:**
```jsx
<Dialog>
  <DialogContent className="bg-brand-900">
    <DialogHeader>
      <DialogTitle>Confirm Purchase</DialogTitle>
    </DialogHeader>
    <DialogBody>
      <p>Are you sure you want to purchase this book?</p>
    </DialogBody>
    <DialogFooter>
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### 3.6 Badge Component

**Variants:**
- `success` (green, for completed/available)
- `warning` (yellow, for pending)
- `error` (red, for issues)
- `info` (blue, for information)
- `neutral` (gray, for default)

**Example:**
```jsx
<Badge variant="success">Available</Badge>
<Badge variant="warning">Pre-order</Badge>
<Badge variant="error">Out of Stock</Badge>
```

---

### 3.7 Tabs Component

**Structure:**
- Tab list (horizontal)
- Tab triggers (pill-style buttons)
- Tab content panels

**Example:**
```jsx
<Tabs defaultValue="about">
  <TabsList className="bg-brand-800">
    <TabsTrigger value="about">About</TabsTrigger>
    <TabsTrigger value="reviews">Reviews</TabsTrigger>
    <TabsTrigger value="club">Book Club</TabsTrigger>
  </TabsList>
  <TabsContent value="about">
    {/* About content */}
  </TabsContent>
</Tabs>
```

---

### 3.8 Skeleton Loader

**Usage:**
- Loading placeholder while data fetches
- Smooth fade-in animation (300ms)

**Example:**
```jsx
{isLoading ? (
  <Skeleton className="h-64 rounded-lg" />
) : (
  <BookCard book={book} />
)}
```

---

## 4. PAGE LAYOUTS

### 4.1 Homepage Layout

```
┌─────────────────────────────────────────────┐
│      Navigation Bar (sticky)                 │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─── HERO SECTION ───────────────────────┐ │
│  │ Gradient background                    │ │
│  │ "Discover Your Next Read"              │ │
│  │ Search Bar (prominent)                 │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌─── FEATURED SECTION ───────────────────┐ │
│  │ "Trending This Week"                   │ │
│  │ [Book] [Book] [Book] [Book]            │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌─── READING JOURNEYS ───────────────────┐ │
│  │ "Start a Personalized Journey"         │ │
│  │ [Journey] [Journey] [Journey]          │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌─── RECOMMENDATIONS ────────────────────┐ │
│  │ "Based on Your Reading"                │ │
│  │ [Book] [Book] [Book] [Book]            │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌─── FOOTER ────────────────────────────┐ │
│  │ Links, copyright, etc.                │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 4.2 Book Detail Page Layout

```
┌──────────────────────────────┬──────────────────┐
│ [Back]                       │                  │
├──────────────────────────────┼──────────────────┤
│ [Book Cover] 200x300         │ Title            │
│                              │ Author           │
│                              │ ⭐ 4.5 (500 ratings)
│                              │                  │
│                              │ €9.99 / Free trial
│                              │ [Add to Cart]    │
│                              │ [Add to Wishlist]│
│                              │                  │
│ ────────────────────────────── ──────────────────│
│ About the Book               │ Book Info        │
│ Lorem ipsum...               │ Pages: 320       │
│                              │ Published: 2024  │
│                              │ ISBN: 123...     │
├──────────────────────────────┴──────────────────┤
│ TABS: [About] [Reviews] [Club] [Previews]      │
├───────────────────────────────────────────────┤
│ Reviews Section                                │
│ [Review 1] [Review 2] [Review 3]             │
└───────────────────────────────────────────────┘
```

---

## 5. RESPONSIVE BREAKPOINTS

| Device | Width | Layout | Column Count |
|--------|-------|--------|--------------|
| **Mobile** | 320–767px | Single column, stacked | 1–2 |
| **Tablet** | 768–1023px | Two column (flexible) | 2–3 |
| **Desktop** | 1024–1919px | Multi-column grid | 3–4 |
| **Wide** | 1920px+ | Constrained max-width (1400px) | 4–5 |

---

## 6. INTERACTION PATTERNS

### Hover States
- **Cards:** scale(1.02), shadow increase
- **Buttons:** opacity +10% or color shift
- **Links:** underline + color change

### Focus States
- 2px outline in #FF6F00 (accent color)
- 2px offset from element

### Active States
- Button: Scale(0.98), shadow increase
- Filter tag: Background filled, text white

### Transitions
- Page fade-in: 300ms
- Button state: 150ms
- Card hover: 200ms

---

## NEXT SECTION  
→ PRD-05-Data-Models.md (Database schema & data structures)
