# 0007 — Dark mode toggle (animated, rectangle) + dark menu photos

> **For the implementing agent (Sonnet):** This plan is self-contained. Read it top to
> bottom before editing. The app already ships a full dark-theme token set in
> [`app/globals.css`](../app/globals.css) (`.dark { … }` block at line 68) — we are NOT
> designing dark colors, only **activating** the `.dark` class and adding a toggle.
> Read [`DESIGN.md`](../DESIGN.md) before any UI change. No raw hex/oklch in components.

## Goal

Let the user switch between light and dark mode. The choice:
- **persists** across reloads (localStorage), and
- **defaults to the OS setting** on first visit (no stored choice yet).

The switcher is the **rectangle** animated theme toggler from
https://magicui.design/docs/components/animated-theme-toggler (a button that plays a
view-transition wipe when toggling). It appears in **two places**:
- the **Till** screen, next to the account avatar ([`AccountMenu`](../src/components/ui/AccountMenu.tsx) area), and
- the **manager** area (sidebar footer, so it shows on every manager page).

When dark mode is on, product photos load from **`public/menu-dark/`** instead of
`public/menu/` — done with **CSS only** (both `<img>` rendered, theme class shows one).

## Why these decisions (already settled with the user)

| Decision | Choice |
|---|---|
| Toggle location | Both Till + manager |
| Persistence | localStorage + system default (use `next-themes`) |
| Image swap | CSS-only, follows the theme class |
| Toast library ("sonner") | **N/A** — that was a typo for "Sonnet". Do not install sonner. |

## Current state (verified)

- **`next-themes` is NOT installed** — must be added.
- `app/globals.css` already has `@custom-variant dark (&:is(.dark *))` (line 5) and a full
  `.dark { … }` token block (line 68). So `dark:` Tailwind variants and the `--*` tokens
  already work the moment a `.dark` class lands on a parent element.
- `app/globals.css` does **not** set `color-scheme`. Add `color-scheme: dark` to the
  `.dark` block so native form controls / scrollbars match.
- Root layout [`app/layout.tsx`](../app/layout.tsx) wraps `children` in `CartProvider`
  only. No theme provider yet.
- Product images: each product in [`src/data/products.ts`](../src/data/products.ts) has a
  single `image: '/menu/<file>.jpg'`. **Every** `public/menu-dark/*.jpg` filename has a
  matching `public/menu/*.jpg`, so the dark path is the light path with `/menu/` →
  `/menu-dark/`. Images render in [`ProductGrid.tsx`](../src/components/till/ProductGrid.tsx)
  via the `ProductPhoto` component (a `next/image` with `onError` fallback).

## Implementation steps

### 1. Install next-themes
```
npm install next-themes
```
> Read `node_modules/next/dist/docs/` if anything about App Router rendering is unclear —
> APIs differ from older Next. `next-themes` works with App Router but its provider is a
> client component, so it must be wrapped correctly (step 2).

### 2. Add the ThemeProvider to the root layout

`next-themes`' `ThemeProvider` is `'use client'`. The root layout is a server component,
so create a thin client wrapper rather than making the whole layout client.

Create `src/components/theme/ThemeProvider.tsx`:
```tsx
'use client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"      // toggles the `.dark` class our tokens key off
      defaultTheme="system"  // OS setting on first visit
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

Edit [`app/layout.tsx`](../app/layout.tsx):
- Add `suppressHydrationWarning` to the `<html>` tag (required by next-themes — it sets the
  class before React hydrates, which would otherwise warn).
- Wrap the existing tree: `<ThemeProvider><CartProvider>{children}</CartProvider></ThemeProvider>`.

### 3. Add `color-scheme` to the dark tokens

In [`app/globals.css`](../app/globals.css), inside the existing `.dark { … }` block (line
68), add:
```css
color-scheme: dark;
```
(Optional but tidy: add `color-scheme: light;` to `:root`.)

### 4. Build the animated rectangle toggle

Reference: https://magicui.design/docs/components/animated-theme-toggler — it's a **single
component file** (not a registry/shadcn dependency), so copy its source rather than running
a CLI. Create `src/components/theme/AnimatedThemeToggler.tsx`.

Adapt it to our stack:
- It uses `document.startViewTransition` for the wipe effect. Guard for browsers without it
  (fall back to a plain class change) so the toggle still works.
- Drive the actual theme through **next-themes**, not the component's own state: use
  `const { resolvedTheme, setTheme } = useTheme()` and toggle
  `setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')`. This is what persists the choice.
- **Avoid hydration mismatch:** `useTheme()` returns `undefined` on the server. Render a
  fixed-size placeholder (same box dimensions) until mounted:
  ```tsx
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="size-7" aria-hidden />
  ```
- Style with **tokens only** (`text-foreground`, `bg-card`, `border-border`, etc.) per
  DESIGN.md — no inline hex. Keep the **rectangle** variant from the docs (not the circle).
- Give it an `aria-label` ("Toggle dark mode") and a `title`.

### 5. Place the toggle in both locations

**Till screen** — next to the account avatar. The avatar is rendered by
[`AccountMenu`](../src/components/ui/AccountMenu.tsx); find where `<AccountMenu />` is used
(top-right of the Till) and add `<AnimatedThemeToggler />` immediately before it, in the
same flex row. Match spacing/size of the existing `size-7` avatar.

**Manager area** — in the sidebar footer so it appears on every manager page. Open
[`src/components/ui/ManagerSidebar.tsx`](../src/components/ui/ManagerSidebar.tsx); it uses
the shadcn sidebar primitives. Put `<AnimatedThemeToggler />` in the
`SidebarFooter` (add one if absent), alongside or above the sign-out control. On mobile the
sidebar is offcanvas — that's fine, the toggle rides along inside it.

> Both placements import the same `AnimatedThemeToggler`. Don't duplicate the component.

### 6. Swap menu photos to dark versions (CSS-only)

Edit `ProductPhoto` in
[`ProductGrid.tsx`](../src/components/till/ProductGrid.tsx). Today it renders one
`next/image` at `product.image`. Change it to render **both** the light and dark image and
let the theme class show exactly one:

- Compute the dark src: `const darkSrc = product.image.replace('/menu/', '/menu-dark/')`.
- Render two `next/image` (or two wrappers): the light one visible by default, hidden under
  `.dark` (`dark:hidden`); the dark one hidden by default, shown under `.dark`
  (`hidden dark:block`).
- Keep the existing `onError` → `ProductPlaceholder` fallback behavior. Simplest: track one
  `failed` flag; if the **light** image errors, fall back to placeholder for both (the
  filenames are paired, so a missing dark twin is unlikely, but if you want to be safe, use
  a separate `darkFailed` flag and fall back per-theme).
- This is **CSS-only**: no `useTheme()` in this component, so no toggle flash and it stays a
  cheap render. Trade-off (accepted by the user): the browser may fetch both images.

> Only product photos have dark twins. `ProductPlaceholder` (the colored letter square)
> already uses tokens, so it adapts to dark automatically — leave it alone.

## Out of scope
- No toast/sonner work.
- No new color tokens — the `.dark` palette already exists.
- No dark variants for non-menu imagery (there are none).

## Verification checklist
- [ ] `npm run build` succeeds; data-fetching pages still render (no SSR theme crash).
- [ ] First load with OS in dark mode → app starts dark. Toggle → light. Reload → stays light (localStorage).
- [ ] No hydration warning in the console (placeholder + `suppressHydrationWarning` in place).
- [ ] Toggle visible and working on **Till** (next to avatar) and on **every manager page** (sidebar footer), including mobile offcanvas.
- [ ] In dark mode, product cards show the `menu-dark/` photos; in light mode the `menu/` photos. The view-transition wipe plays on toggle (and degrades gracefully where unsupported).
- [ ] Sold-out overlay and hover tint still look right in dark mode (check the `rgba(255,255,255,0.9)` sold-out chip — if it looks wrong on dark, switch it to a token).
```

