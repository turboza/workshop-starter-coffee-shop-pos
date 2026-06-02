@AGENTS.md

# Coffee Shop POS — Codebase Guide

## Project

A tablet-first POS app for Lina's Coffee. Orders saved to Supabase; dashboard reads real data.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS v4** — uses `@import "tailwindcss"` syntax, NOT the old `@tailwind` directives
- **Fonts**: Geist (body), Geist Mono (receipt), Caveat (display headings)
- **Supabase** — cloud Postgres database (`ialqovihedyaycazhwyh.supabase.co`)
- No external UI library, no chart library

## Communication style

The user is non-technical. Always explain in plain, simple language — no jargon.
Use Excel/finance analogies when helpful (e.g. "think of this like a spreadsheet tab").
When something goes wrong, explain what happened and why in one plain sentence before fixing it.

## Key rules from AGENTS.md

Read `node_modules/next/dist/docs/` before writing Next.js code. APIs changed.
Notable: `useRouter` is from `next/navigation`, never `next/router`. Never call
`router.push()` during render — put it in `useEffect`.

## File map

```
src/
  types/index.ts            — Product, CartItem, Order, PaymentMethod, Category
  lib/supabase.ts           — shared Supabase client (createClient with env vars)
  data/products.ts          — 30 products across 5 categories + upcharge tables (still in code, not DB)
  data/sampleOrders.ts      — kept as reference; no longer used by LiveFeed
  data/stats.ts             — sample stats; still used for Top Products, Avg Ticket, Voids (sample data)
  context/CartContext.tsx   — CartProvider + useCart() hook (useReducer)
  components/
    ui/Badge.tsx            — new | void | live variants
    ui/ProductPlaceholder.tsx — colored letter square, color derived from name hash
    till/CategoryTabs.tsx   — category pill tabs + search input
    till/ProductGrid.tsx    — 4-col (2-col mobile) product cards, SOLD OUT overlay
    till/CartPanel.tsx      — order items, qty controls, subtotal/VAT/total, Charge button
    till/CustomizeModal.tsx — size/milk/extras pills, barista note, live price, qty stepper
    dashboard/StatCard.tsx  — label / big value / comparison sub-line; accepts optional `sample` prop
    dashboard/DashboardLive.tsx — CLIENT component; receives raw orders, filters to today in browser
                                  timezone, renders stat cards + hourly chart
    dashboard/HourlyChart.tsx — CLIENT component; accepts raw orders, buckets by local hour
    dashboard/TopProducts.tsx — TODAY/WEEK/MONTH toggle, horizontal bar ranks (sample data)
    dashboard/LiveFeed.tsx  — order list with NEW/VOID badges; accepts `orders` prop
app/
  layout.tsx                — root layout, CartProvider, Caveat + Geist fonts
  globals.css               — CSS variables (see Design tokens below), Tailwind v4 import
  page.tsx                  — Till screen (default route)
  payment/page.tsx          — Cash/Card selector, quick-cash buttons, change calc; saves to Supabase on confirm
  receipt/page.tsx          — Formatted receipt, 5s auto-return, Print/Email/SMS stubs
  dashboard/page.tsx        — Server component (force-dynamic); fetches last 48h orders, passes to DashboardLive
supabase/
  migrations/               — SQL migration files applied to cloud DB
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

## Supabase setup

- Cloud project ref: `ialqovihedyaycazhwyh`
- Env vars needed locally: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`
- Both vars are also set in Vercel (production environment)
- CLI is linked: `supabase link --project-ref ialqovihedyaycazhwyh`
- To apply new migrations: `supabase migration new <name>` → edit SQL → `supabase db push`
- RLS is enabled on all tables. Current policies are open (anon read/write) — tighten when auth is added

## Lessons learned this session

**Next.js static vs dynamic rendering**
Dashboard pages that fetch live data MUST have `export const dynamic = 'force-dynamic'` at the top. Without it, Next.js pre-renders the page once at build time (when the DB is empty) and serves that frozen snapshot forever. The build output shows `○ (Static)` vs `ƒ (Dynamic)` — always check this for data-fetching pages.

**Timezone-aware data in server components**
`new Date()` on a Vercel server always returns UTC. If you bucket order timestamps by hour or filter by "today" on the server, users in other timezones (e.g. Bangkok = UTC+7) will see wrong results. Fix: pass raw ISO timestamp strings from the server to a `'use client'` component, and do all time calculations there using `new Date(isoString).getHours()` — the browser's JS engine applies the user's local timezone automatically.

**Supabase publishable key naming**
The newer Supabase projects use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (not the older `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Always check what key names are actually in `.env.local` before writing client code.

**Order line items as frozen snapshots**
Storing `product_name` + `unit_price` as plain text in `order_items` (rather than a FK to a products table) is the correct approach for receipts — the name/price at time of sale is preserved even if the menu changes later. This also avoids needing a products table for the orders feature to work.

## Next steps

See SPEC.md for the full feature roadmap. Next priorities:
1. Move products to Supabase (completes Phase 2) — rewires Till screen, enables real Top Products
2. Add `voided` column to `orders` + void workflow
3. Auth (Phase 4) — then tighten RLS policies
