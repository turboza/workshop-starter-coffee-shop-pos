# Inventory / Stock Page — Build Prompt (Phase 1)

> Paste everything in the **PROMPT** section below to Sonnet, and **attach the inventory mockup image** in the same message.
> Start the message with: *"Build the page shown in the attached mockup:"*

---

## PROMPT

Build a new **Inventory / Stock** page for this Coffee Shop POS app. Read `CLAUDE.md` and `AGENTS.md` first — follow every convention there exactly (Next.js 16 APIs, design tokens, auth clients, no custom Tailwind color classes). Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code.

### Goal
A tablet/desktop page at `/inventory` that lets Lina track ingredient stock levels, adjust counts inline, run a full stocktake, and review the change history. It reads real data from Supabase.

### 1. Database (new migration via `supabase migration new inventory`)

**Future-proofing note:** This is Phase 1 — inventory is standalone (manual adjust + stocktake only). A later phase will auto-deduct ingredients when an order is saved, via a recipe table that maps products → ingredients. Design for that now: keep `ingredients.id` a stable uuid (don't key recipes off the text name), and make `stock_adjustments.reason` a free text field so a `'sale'` reason can be added later with no schema change. Do **not** build the recipe table or any order-linking logic yet.

Mirror the existing `orders` / `order_items` pattern. Counts are stored as integers in **hundredths** (like cents) to allow decimals like `11.4 kg` without floats — e.g. `11.4 kg` is stored as `1140`. Follow this convention everywhere and convert at the UI edge.

**Table `ingredients`:**
- `id` uuid primary key default `gen_random_uuid()`
- `name` text not null (e.g. "Coffee beans · Light roast")
- `unit` text not null (e.g. "kg", "L", "g", "pc")
- `count_h` int not null default 0 — current on-hand, in hundredths
- `par_h` int not null — par level, in hundredths
- `sort_order` int not null default 0
- `created_at` timestamptz not null default `now()`

**Table `stock_adjustments`** (append-only audit log, never edited — same "frozen snapshot" idea as order_items):
- `id` uuid primary key default `gen_random_uuid()`
- `ingredient_id` uuid not null references `ingredients(id)` on delete cascade
- `previous_h` int not null
- `new_h` int not null
- `delta_h` int not null
- `reason` text — e.g. 'adjust', 'stocktake', 'restock'
- `cashier` text not null (who made the change)
- `created_at` timestamptz not null default `now()`

Enable RLS on both tables. **Match the current auth model** (migration `20260604064712` requires the `authenticated` role — do NOT use open `anon` policies): create `for all to authenticated using (true) with check (true)` policies on both tables.

Seed the 12 ingredients from the mockup with realistic `count_h`/`par_h` (Coffee beans · Light roast 11.4/8 kg, Dark roast 3.1/5 kg, Milk · Whole 22/12 L, Milk · Oat 1.8/8 L, Milk · Soy 8/5 L, Matcha powder 320/200 g, Chocolate syrup 3.4/3 L, Cups · 16oz 180/150 pc, Lids · 16oz 60/120 pc, Straws · paper 480/200 pc, Croissants 6/10 pc, Pain au choc 14/8 pc) with incrementing `sort_order`.

### 2. Status logic (shared helper)
Given `count_h` and `par_h`:
- **below par** if `count_h < par_h` → red
- **approaching** if `count_h < par_h * 1.2` (within 20% above par) → amber/yellow
- **ok** otherwise → green

Put this in a small pure helper so the page, the summary chips, and the row badges all agree.

### 3. Types (`src/types/index.ts`)
Add:
```ts
export type StockStatus = 'below' | 'approaching' | 'ok'
export interface Ingredient {
  id: string
  name: string
  unit: string
  count: number      // human units (count_h / 100)
  par: number        // human units (par_h / 100)
}
export interface StockAdjustment {
  id: string
  ingredientId: string
  previous: number
  next: number
  delta: number
  reason: string
  cashier: string
  timestamp: string
}
```

### 4. Page (`app/inventory/page.tsx`)
- Server component with `export const dynamic = 'force-dynamic'` (data is live — see CLAUDE.md note on static vs dynamic).
- Use `createSupabaseServerClient()` from `lib/supabase-server.ts`. Fetch all ingredients ordered by `sort_order`, and the recent `stock_adjustments` (e.g. last 50). Convert `_h` integers to human units, pass to a `'use client'` component.

### 5. Client UI (`src/components/inventory/InventoryView.tsx` + sub-components)
Match the mockup layout and use **only the design tokens** (`var(--foreground)`, `var(--muted-foreground)`, `var(--primary)`, `var(--card)`, `var(--border)`, `var(--destructive)`, `var(--success)`, etc.). Use `font-display` (Caveat) for the "Stock · today HH:MM" heading.

- **Header:** title with live time, "N ingredients tracked · one location" subline, and three summary chips (X BELOW PAR red / Y APPROACHING amber / Z HEALTHY green) computed from status logic.
- **Filter row:** pill tabs `All` / `Low stock · N` / `Approaching · N` (active pill = primary background) plus a search-by-ingredient input. Filtering/search done client-side (model after `CategoryTabs.tsx` / `TopProducts.tsx` toggle style).
- **Table:** columns INGREDIENT · UNIT · ON-HAND VS PAR (a horizontal bar showing on-hand vs a par tick mark — green/red fill by status, like the bars in `TopProducts.tsx`) · COUNT (the tap-to-edit number) · PAR · STATUS badge. Below-par rows get a faint red row tint.
- **Inline adjust:** tapping a COUNT cell turns it into a stepper (− value + ) with editable input. On commit, write the new count to Supabase using `createSupabaseBrowserClient()`: update `ingredients.count_h` AND insert a `stock_adjustments` row (previous/new/delta, `reason: 'adjust'`). Get the cashier name fresh from `supabase.auth.getUser()` → `user.user_metadata.name` inside the handler (per CLAUDE.md — do NOT rely on mount-time state). Then refresh the data (`router.refresh()`).
- **Footer:** "Tap any count to adjust — every change is logged with who & when." on the left; "Last full stocktake: <date> · by <name>" on the right (derived from the most recent `reason: 'stocktake'` adjustment, or "—" if none).

### 6. History panel
Add a slide-over/drawer (or expandable panel) that shows the recent `stock_adjustments` — ingredient name, previous → new, delta with sign, who, and relative/clock time. Make it openable per-row (e.g. clicking the row name) and/or a global "History" toggle. Reuse the Badge component where it fits.

### 7. Full stocktake ("New stock count" button)
Clicking "New stock count" opens a mode/modal listing every ingredient with an input pre-filled to its current count. Lina edits the real counts, then confirms. On confirm: for each ingredient whose value changed, update `count_h` and insert a `stock_adjustments` row with `reason: 'stocktake'` (same cashier-from-auth rule). Show a confirm summary before writing. After save, `router.refresh()`.

### 8. Navigation
Add an "Inventory" link to the app's nav/sidebar so the page is reachable, matching existing nav styling.

### Constraints
- The attached image is a **visual layout reference only** — match the structure, columns, bars, badges, chips, and filter pills. Do NOT hardcode any of its values (counts, "12 ingredients", the "08:42" time, the "4 BELOW PAR" numbers, the ingredient rows). Every number, status, time, and summary chip must be computed from the live Supabase data. The seed data in the migration is the only place those specific numbers belong.
- All money/count math on integers; convert only at display.
- No external chart/UI library — build bars with divs as in `TopProducts.tsx`.
- Never call `router.push`/`refresh` during render — only in handlers/effects.
- Keep components small and typed (strict TS).
- After building, run the build and confirm the page shows as `ƒ (Dynamic)`, not `○ (Static)`.

---

## Phase 2 (later — NOT in this build)

Link sales to inventory: add a **recipe table** mapping each product → the ingredients it uses (and how much). When an order is saved, look up the recipe for each sold item and auto-deduct those ingredients, logging each one as a `stock_adjustments` row with `reason: 'sale'`. Main upfront work: defining recipes for all 30 products (and whether size/extra shots change the amounts).
