# Design Guidelines — Coffee Shop POS

How we build UI in this project. Read this before adding or changing any screen.

This is a **guideline**, not a token list. The actual values (colors, radius, shadows,
fonts) live in [`app/globals.css`](app/globals.css) — that file is the single source of
truth. This doc tells you *how to use* what's there, and the rules every page follows.

> **One source of truth.** Never copy hex/oklch values into this file, a component, or
> CLAUDE.md. If a value is wrong, fix it in `globals.css` and everything updates. Past
> drift (CLAUDE.md once described an old blue palette the app no longer uses) is exactly
> what this rule prevents.

---

## The theme in one paragraph

A **tablet-first POS** for Lina's Coffee with a calm, warm look. The brand color is a
**warm orange** (`--primary`); the surface is a soft near-white (`--background`) with white
cards (`--card`). It's built on **shadcn** (the `base-nova` style — base primitives, *not*
radix) with all design values defined as **oklch CSS variables** in `globals.css`, exposed
to Tailwind via the `@theme inline` block. Light and dark are both defined; every token
exists in both `:root` and `.dark`.

---

## Core principles

### 1. Tokens, never raw hex
Every color comes from a CSS variable. **No raw hex or oklch literals in components.**

- Use the Tailwind token classes that `@theme inline` generates — `bg-primary`,
  `text-muted-foreground`, `border-border`, `bg-destructive`, etc.
- Where the existing code uses inline `style={{ color: 'var(--foreground)' }}`, that's an
  accepted pattern in this repo — match the surrounding file. Don't convert a whole page
  from inline-var style to Tailwind tokens (or vice-versa) in an unrelated change.
- Need a color that doesn't exist (e.g. a new status)? **Add a token pair** to *both* the
  `:root` and `.dark` blocks in `globals.css` in the same `oklch(...)` style as its
  neighbors (and register it in `@theme inline`). Do not inline the value. This is how
  `--success`, `--warning`, and `--sidebar-active` were added.

Available token families (see `globals.css` for values): `background`/`foreground`,
`card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, **`success`**,
**`warning`**, `border`, `input`, `ring`, `chart-1..5`, and the `sidebar-*` set (including
`sidebar-active` / `sidebar-active-foreground` for the "you are here" state).

### 2. shadcn-first — don't hand-roll what a component provides
Before building any interactive UI, check `components/ui/` and the **`shadcn` skill**.

- Installed today: `badge`, `button`, `card`, `dialog`, `input`, `separator`, `sheet`,
  `sidebar`, `skeleton`, `table`, `toggle` / `toggle-group`, `tooltip`.
- Need more? `npx shadcn@latest add <component>`, and read its docs first:
  `npx shadcn@latest docs <component>`.
- **This repo uses the `base` variant, not radix** — APIs differ from memory. Custom
  triggers use the `render` prop, *not* radix's `asChild`. Interactive components need
  `'use client'` (RSC is off in `components.json`). Always confirm the installed API before
  writing.
- Compose primitives; don't re-implement tables, dialogs, sheets, toggles, or badges by
  hand. (The inventory and users pages were explicitly migrated *away* from hand-rolled
  markup for this reason.)

### 3. Color restraint — one loud thing per view
Color is a signal; if everything is colored, nothing stands out.

- Aim for **at most one filled-primary element and one red (`destructive`) element** in a
  given header or toolbar. Everything else stays quiet: `outline`, `secondary`, `ghost`,
  or muted text.
- Reserve `destructive` for "needs action now" (e.g. below-par stock). Use `success` /
  `warning` sparingly and prefer *one* carrier of a status (the badge), not three (badge +
  bar + row-tint all at once).
- The least important number should be the quietest — fold it into a muted subline rather
  than giving it its own colored chip.

### 4. Active ≠ hover, and hover is consistent
For any navigable/clickable surface (sidebar especially):

- **Active** ("you are here") and **hover** must be **two visually distinct treatments**.
  Active uses the tinted `--sidebar-active` wash + orange text/icon + a left accent bar —
  subtle, not a solid fill. Hover uses the neutral `--sidebar-accent` gray wash.
- **Hover is identical** across every clickable row of the same group (nav links, "Back to
  till", "Sign out" all feel the same on hover). Hovering the active item must *not* flip
  it to a solid block.
- Only **one** item is active per route, driven by `pathname === href`.

### 5. Mobile-first responsive (tablet is home, phone must work)
The app is tablet/desktop-first, but every manager screen must be usable at **375px**
(iPhone SE). Rules that have held across pages:

- **No horizontal page scroll** at 375px. No clipped numbers or buttons. Comfortable tap
  targets — **don't go below ~36px** for touch controls.
- **Stack on mobile, tabulate on desktop.** Render the data once and switch presentation
  with Tailwind breakpoints (`hidden md:block` / `md:hidden`): a stacked `Card` list under
  `md`, a shadcn `Table` at `md+`. Avoid fixed multi-column grids that can't reflow.
- Breakpoints: Tailwind defaults. Treat **< `md` (768px)** as "phone". The sidebar is
  `collapsible="offcanvas"` — a permanent rail on desktop, a slide-in drawer on mobile.
  Every manager page needs a `md:hidden` top bar holding `<SidebarTrigger>` so the drawer
  can be opened; use the canonical `SidebarTrigger`, never a custom hamburger.
- Scale oversized display text down on phones (e.g. `text-2xl md:text-3xl`,
  `text-3xl md:text-4xl`) so it doesn't wrap or clip.

### 6. Typography
- **Geist** for body, **Geist Mono** for receipt/monospace, **Caveat** (`font-display`)
  for friendly display headings (e.g. "Stock · today HH:MM", footer italics). Use
  `font-display` only where that handwritten warmth is intended — not for data.
- Group/section labels stay quiet: small, uppercase, `text-muted-foreground`.

### 7. Radius, shadows, spacing
- Use the radius scale from tokens (`--radius` = `0.75rem`; `rounded-md/lg/xl` map to it).
  Don't invent one-off corner radii.
- Shadows are deliberately soft (`--shadow-*`). Prefer `border` + a subtle shadow over
  heavy elevation. Let shadcn `Card` handle border/radius/shadow rather than re-deriving
  it on a raw div.

---

## Money & counts (display rule, not styling)
Numbers are stored as integers and converted only at the display edge:
- **Money / VAT:** VAT is 7%, already included in the shown total. `vat = round(subtotal *
  0.07)`, `total = subtotal + vat`.
- **Stock counts:** stored in hundredths (`count_h`), shown as human units (`count_h /
  100`). Do all math on the integers; convert only when rendering.

---

## When you add a new screen — checklist
- [ ] No raw hex/oklch in the component — only token classes or `var(--token)`.
- [ ] New colors added as token pairs in `globals.css` (light **and** dark), not inlined.
- [ ] Built from shadcn components in `components/ui/`; docs checked for the `base` API.
- [ ] At most one filled-primary + one destructive element competing for attention.
- [ ] Active vs hover are distinct; hover is consistent across siblings.
- [ ] Works at 375px: no horizontal scroll, nothing clipped, tap targets ≥ ~36px.
- [ ] Mobile `SidebarTrigger` top bar present (manager pages).
- [ ] Data-fetching pages export `dynamic = 'force-dynamic'` (see CLAUDE.md) — and time/
      "today" math runs in a client component using the browser's local timezone.

---

## See also
- [`app/globals.css`](app/globals.css) — the token definitions (source of truth for values).
- [`CLAUDE.md`](CLAUDE.md) — engineering conventions (Next.js 16 APIs, Supabase/auth, VAT,
  cart state, lessons learned).
- [`components.json`](components.json) — shadcn config (`base-nova`, RSC off, lucide icons).
- `plan/` — page-by-page build/redesign briefs these principles were distilled from.
