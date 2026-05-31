@AGENTS.md

# Coffee Shop POS — Codebase Guide

## Project

A tablet-first POS app for Lina's Coffee. All data is in-memory (no database yet).
Live at: https://coffee-shop-pos-phi.vercel.app

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS v4** — uses `@import "tailwindcss"` syntax, NOT the old `@tailwind` directives
- **Fonts**: Geist (body), Geist Mono (receipt), Caveat (display headings)
- No external UI library, no chart library, no backend

## Key rules from AGENTS.md

Read `node_modules/next/dist/docs/` before writing Next.js code. APIs changed.
Notable: `useRouter` is from `next/navigation`, never `next/router`. Never call
`router.push()` during render — put it in `useEffect`.

## File map

```
src/
  types/index.ts            — Product, CartItem, Order, PaymentMethod, Category
  data/products.ts          — 30 products across 5 categories + upcharge tables
  data/sampleOrders.ts      — 5 historical orders for the live feed
  data/stats.ts             — hourly revenue, daily stats, top products (today/week/month)
  context/CartContext.tsx   — CartProvider + useCart() hook (useReducer)
  components/
    ui/Badge.tsx            — new | void | live variants
    ui/ProductPlaceholder.tsx — colored letter square, color derived from name hash
    till/CategoryTabs.tsx   — category pill tabs + search input
    till/ProductGrid.tsx    — 4-col (2-col mobile) product cards, SOLD OUT overlay
    till/CartPanel.tsx      — order items, qty controls, subtotal/VAT/total, Charge button
    till/CustomizeModal.tsx — size/milk/extras pills, barista note, live price, qty stepper
    dashboard/StatCard.tsx  — label / big value / comparison sub-line
    dashboard/HourlyChart.tsx — pure CSS bar chart, hover tooltip
    dashboard/TopProducts.tsx — TODAY/WEEK/MONTH toggle, horizontal bar ranks
    dashboard/LiveFeed.tsx  — order list with NEW/VOID badges
app/
  layout.tsx                — root layout, CartProvider, Caveat + Geist fonts
  globals.css               — CSS variables (see Design tokens below), Tailwind v4 import
  page.tsx                  — Till screen (default route)
  payment/page.tsx          — Cash/Card selector, quick-cash buttons, change calc
  receipt/page.tsx          — Formatted receipt, 5s auto-return, Print/Email/SMS stubs
  dashboard/page.tsx        — Owner dashboard, sidebar nav
```

## Design tokens (globals.css)

```
--bg: #EEF4FB          background
--bg-subtle: #E2ECF8   hover/secondary bg
--card: #ffffff
--accent: #3B82F6      primary blue
--accent-dark: #1D4ED8
--accent-light: #DBEAFE
--text: #1E293B
--text-muted: #64748B
--text-faint: #94A3B8
--border: #CBD5E1
--border-light: #E2E8F0
--destructive: #991B1B
--success: #15803D
```

Always use `style={{ color: 'var(--text-muted)' }}` — do NOT add custom Tailwind color classes.
Use `font-display` class for Caveat headings, `font-mono` for receipt text.

## Cart state

`CartContext` holds items, order number, cashier, and the last completed order.
- `addItem(CartItem)` — merges if same product+options already in cart
- `completeOrder(method, cashReceived?)` — saves Order to `completedOrder`
- `clearCart()` — resets items + increments order number

Receipt page reads `completedOrder`; if null it redirects to `/`.
Payment page redirects to `/` if cart is empty (via `useEffect`, not render-time).

## VAT

VAT is 7%, already included in the displayed total (not added on top).
`vat = Math.round(subtotal * 0.07)` · `total = subtotal + vat`

## Next steps

See SPEC.md for the full feature roadmap. The immediate next phase is connecting
to a real database (Supabase) — data models and types are already defined in
`src/types/index.ts` and match what the DB tables will need.
