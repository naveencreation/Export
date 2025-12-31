# NS Exports — UI Planning & Design System

## 1. Brand Interpretation (From Logo)

From the logo:

* **Deep Navy Blue** → Trust, reliability, international business
* **Gold Accent** → Premium, authority, success
* **Compass / Direction motif** → Global exports, navigation, confidence

**Brand personality**

* Professional
* Trust-first
* Calm, premium (not flashy)
* Enterprise-ready

This is **not** a startup neon UI — it’s a  **serious export company dashboard** .

---

## 2. Core Design Principles

These rules must be followed across the app:

1. **Low saturation, high contrast**
2. **More spacing, fewer borders**
3. **Cards > tables > forms hierarchy**
4. **Gold only for emphasis (never overused)**
5. **Typography over decoration**

---

## 3. Final Color Palette (Locked)

### 🎯 Primary Palette (Mapped to Logo)

| Token            | Color       | Usage          |
| ---------------- | ----------- | -------------- |
| `--background` | `#F8FAFC` | App background |
| `--foreground` | `#0F172A` | Primary text   |
| `--card`       | `#FFFFFF` | Cards          |
| `--border`     | `#E5E7EB` | Subtle borders |

### 🔵 Brand Blue (Primary)

| Token                    | Color       | Usage            |
| ------------------------ | ----------- | ---------------- |
| `--primary`            | `#0B3C5D` | Buttons, sidebar |
| `--primary-foreground` | `#FFFFFF` | Text on primary  |

### 🟡 Gold Accent (Premium)

| Token                   | Color       | Usage              |
| ----------------------- | ----------- | ------------------ |
| `--accent`            | `#C9A24D` | Highlights, badges |
| `--accent-foreground` | `#0F172A` | Text on gold       |

### ⚠️ Status Colors

| Status  | Color       |
| ------- | ----------- |
| Success | `#15803D` |
| Warning | `#B45309` |
| Error   | `#B91C1C` |

> 🚫 No gradients in MVP
>
> 🚫 No bright blues or purples

---

## 4. Tailwind + shadcn Theme Setup

### `app/globals.css`

<pre class="overflow-visible! px-0!" data-start="1971" data-end="2246"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-css"><span><span>:root</span><span> {
  </span><span>--background</span><span>: </span><span>248</span><span></span><span>250</span><span></span><span>252</span><span>;
  </span><span>--foreground</span><span>: </span><span>15</span><span></span><span>23</span><span></span><span>42</span><span>;

  </span><span>--card</span><span>: </span><span>255</span><span></span><span>255</span><span></span><span>255</span><span>;
  </span><span>--card-foreground</span><span>: </span><span>15</span><span></span><span>23</span><span></span><span>42</span><span>;

  </span><span>--primary</span><span>: </span><span>11</span><span></span><span>60</span><span></span><span>93</span><span>;
  </span><span>--primary-foreground</span><span>: </span><span>255</span><span></span><span>255</span><span></span><span>255</span><span>;

  </span><span>--accent</span><span>: </span><span>201</span><span></span><span>162</span><span></span><span>77</span><span>;
  </span><span>--accent-foreground</span><span>: </span><span>15</span><span></span><span>23</span><span></span><span>42</span><span>;

  </span><span>--border</span><span>: </span><span>229</span><span></span><span>231</span><span></span><span>235</span><span>;
}
</span></span></code></div></div></pre>

This ensures  **shadcn components inherit brand colors automatically** .

---

## 5. Typography (Very Important)

### ✅ Font Choice (Premium + Trust)

#### Primary Font

**Inter**

* Clean
* Enterprise standard
* Excellent readability

<pre class="overflow-visible! px-0!" data-start="2480" data-end="2626"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>// app/layout.tsx</span><span>
</span><span>import</span><span> { </span><span>Inter</span><span> } </span><span>from</span><span></span><span>"next/font/google"</span><span>;

</span><span>const</span><span> inter = </span><span>Inter</span><span>({
  </span><span>subsets</span><span>: [</span><span>"latin"</span><span>],
  </span><span>variable</span><span>: </span><span>"--font-inter"</span><span>,
});
</span></span></code></div></div></pre>

### Font Usage Rules

| Element         | Font Weight |
| --------------- | ----------- |
| Page Titles     | 600         |
| Section Headers | 500         |
| Body Text       | 400         |
| Tables          | 400         |
| Buttons         | 500         |

> ❌ No fancy fonts
>
> ❌ No script fonts

---

## 6. App Layout Structure (UI Planning)

### Global Layout

<pre class="overflow-visible! px-0!" data-start="2899" data-end="3178"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>┌──────────────────────────────────────────┐
│ Sidebar        │ Topbar                   │
│ (Logo + </span><span>Nav</span><span>)   ├─────────────────────────┤
│                │ </span><span>Main</span><span></span><span>Content</span><span> Area        │
│                │ (Cards / Tables / Forms)│
└──────────────────────────────────────────┘
</span></span></code></div></div></pre>

---

## 7. Sidebar Design (Trust-First)

### Sidebar Styling

* Background: **Primary Blue**
* Text: White (80% opacity)
* Active item: Gold accent bar

### Sidebar Content

1. Company Logo (top)
2. Overview
3. Products
4. Add / Edit Products

### UX Rules

* Icons + text
* No collapsible complexity in MVP
* Fixed width

---

## 8. Topbar Design

### Elements

* Page title (left)
* Optional search (future)
* User placeholder (right)

### Styling

* White background
* Bottom border only
* No shadow

---

## 9. Page-Level UI Planning

---

### 🟦 Overview Dashboard

**Layout**

* 2 rows of stat cards
* Equal spacing
* No charts initially

**Stat Card Design**

* White card
* Bold number
* Subtle icon
* Gold accent only for key metrics

---

### 🟦 Product Listing Page

**Table Rules**

* Use `shadcn/ui Table`
* Left-aligned text
* No vertical borders
* Zebra rows optional

**Filters**

* Category select (top left)
* Search input (top right)

---

### 🟦 Product Edit Page

**Form Layout**

* Card-based
* Two-column on desktop
* One-column on mobile

**Buttons**

* Primary: Save
* Secondary: Cancel
* Destructive: Delete (red)

---

## 10. shadcn/ui Components to Use (Strict)

You must install and use these  **only** :

<pre class="overflow-visible! px-0!" data-start="4402" data-end="4676"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>npx shadcn@latest init
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add table
npx shadcn@latest add input
npx shadcn@latest add </span><span>select</span><span>
npx shadcn@latest add badge
npx shadcn@latest add dropdown-menu
npx shadcn@latest add alert-dialog
</span></span></code></div></div></pre>

### Rules

* ❌ Do NOT override component styles inline
* ❌ Do NOT add custom CSS per component
* ✅ Use Tailwind utility classes only

---

## 11. Visual Trust Enhancers (Small but Powerful)

* Consistent spacing (`space-y-6`)
* Rounded corners (`rounded-xl`)
* Subtle shadows (`shadow-sm`)
* Clear empty states
* No animations in MVP

---

## 12. Final UI Direction Summary

✔ Enterprise-grade

✔ Export-company appropriate

✔ Trust & authority focused

✔ shadcn-native

✔ Cursor-friendly

✔ Easy to scale
