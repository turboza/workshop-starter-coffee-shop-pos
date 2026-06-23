# Inventory Page — Redesign Prompt (Phase 1.5: shadcn + UX cleanup)

> Paste everything in the **PROMPT** section below to Sonnet, and **attach the current inventory screenshot** in the same message.
> Start the message with: *"Here is the current inventory page (screenshot attached). Redesign it per this brief:"*

This is a **redesign of an existing, working page** — not a rebuild. All the data wiring, Supabase reads/writes, status logic, stocktake, and history already work and must keep working. The job is purely visual/UX: migrate hand-rolled markup to shadcn components, kill the color noise, and tighten the layout.

---

## PROMPT

Redesign the existing **Inventory / Stock** page. It already works end-to-end — keep every behavior; change only the UI. Read `CLAUDE.md` and `AGENTS.md` first and follow every convention (Next.js 16 APIs, design tokens, no custom Tailwind color classes, never call `router.refresh` during render). Read the relevant guide in `node_modules/next/dist/docs/` before touching Next.js code.

### What exists today (do not break)
- Route: `app/(manager)/inventory/page.tsx` — server component, `force-dynamic`, fetches `ingredients` + last 50 `stock_adjustments`, converts hundredths→human units, passes to the client view. **Leave this file's data logic alone.**
- Client: `src/components/inventory/InventoryView.tsx` — one file holding `SummaryChips`, `StockBar`, `StatusBadge`, `CountStepper`, `HistoryPanel` (slide-over), `StocktakeModal`, `LiveClock`, and the main `InventoryView`.
- Status helper: `src/lib/stockStatus.ts` → `getStockStatus(count, par)` returns `'below' | 'approaching' | 'ok'`. **Reuse it. Do not re-implement the thresholds.**
- Writes: inline adjust and stocktake both update `ingredients.count_h` and insert a `stock_adjustments` row, getting the cashier fresh from `supabase.auth.getUser()`. **Keep this exactly.**

### shadcn components already installed (in `components/ui/`)
`button`, `input`, `separator`, `sheet`, `sidebar`, `skeleton`, `tooltip` — reuse these as-is.

You need to install the rest. Run exactly (the project's package runner is `npx`):

```bash
npx shadcn@latest add badge table toggle-group dialog
# optional layout/polish:
npx shadcn@latest add card empty
```

All of these were verified present in the `@shadcn` registry. Use the shadcn skill, fetch each component's docs with `npx shadcn@latest docs <component>` before using it, and compose primitives — do not hand-roll anything shadcn provides. The project's `components.json` uses style `base-nova`, RSC off (`'use client'` is required for interactive components), `base` primitives (use the base API — `render` prop for custom triggers, not radix's `asChild`), lucide icons.

### Core problems to fix

**1. Too many colors / the 5 chips-and-buttons row under the title is overwhelming.**
Today the header crams in: 3 solid-filled summary chips (red/amber/green), a `History` button, and a `New stock count` button — all on one line, three of them loud filled blocks. Redesign so the eye lands on *one* thing (what needs reordering), not five competing blocks.
- Replace the three solid summary chips with **shadcn `Badge`** in quiet variants. Only "below par" should carry real color (destructive). "Approaching" and "healthy" should be subtle/outline/secondary — muted, not filled. The healthy count is the least important number on the page; make it the quietest (or fold it into the subline as plain text, e.g. "7 healthy" in muted text).
- Move the two **actions** (`History`, `New stock count`) to their own cluster, visually separated from the status summary (a `Separator`, or put status on the left and actions on the right). Only `New stock count` is `default`/primary; `History` is `ghost` or `outline`.
- Net effect: at most one filled-primary button and one red badge in the header. Everything else quiet.

**2. Color is doing too much work and isn't even tokenized.**
The current code hardcodes hex colors (`#b45309` amber, `#15803d` green, `#99111120`, etc.) because there is no `--success` or `--warning` token — only `--primary`, `--destructive`, `--muted`, `--border`, `--foreground` exist (see `app/globals.css`).
- **Add `--success` and `--warning` (+ matching `-foreground`) tokens** to both the `:root` and `.dark` blocks in `app/globals.css`, in the same `oklch(...)` style as the neighbors. Pick a muted green and a muted amber that sit calmly next to the existing warm `--primary`. Then replace every hardcoded hex in the inventory components with `var(--success)` / `var(--warning)` / `var(--destructive)`. No raw hex anywhere when you're done.
- Reduce *how much* gets colored. The on-hand bar, the status badge, and the row tint are currently all colored at once for the same row — that triples the signal. Prefer: keep the **status badge** as the primary color signal, make the **bar** mostly neutral (a single muted fill + a clear par tick, only turning red when genuinely below par), and **drop or greatly soften the red row-tint** (it currently uses a 6% destructive mix — either remove it or make it a thin left-border accent instead of a full-row wash). Aim for a table that reads as mostly calm grayscale with red appearing only where action is truly needed.

**3. Migrate hand-rolled markup → shadcn, for consistency and better UX.**
- **Table** → shadcn `Table` (`TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`). Right-align COUNT and PAR via the cell, not ad-hoc classes.
- **Status badge + summary chips** → shadcn `Badge`.
- **Filter pills** (`All` / `Low stock · N` / `Approaching · N`) → shadcn **`ToggleGroup`** (`ToggleGroupItem`), single-select. These are mutually-exclusive filter options over the *same* table — NOT content panels — so per the shadcn skill rule (2–7 choices = ToggleGroup), use ToggleGroup, **not** `Tabs`. It handles active state and focus ring for you. Keep the counts in the labels.
- **Search input** → shadcn `Input` (add a lucide `Search` icon inside).
- **Stocktake modal** → shadcn `Dialog` (`DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`). Keep its three phases (edit → confirm → saving) and the "only changed rows are saved" logic.
- **History slide-over** → shadcn `Sheet` (it's already installed) with `SheetContent side="right"`. Keep per-row open (clicking a name filters to that ingredient) and the global History button (all changes).
- **Inline count stepper** → compose shadcn `Button` (the − / + and ✓ / ✕) + `Input`. Replace the `✓`/`✕`/`−` glyphs with lucide icons (`Check`, `X`, `Minus`, `Plus`). Keep Enter-to-commit / Escape-to-cancel and the `0.1` step for kg/L vs `1` for pc/g.
- **Buttons everywhere** → shadcn `Button` with proper variants (`default`, `outline`, `ghost`, `destructive`) instead of inline-styled `<button>`.
- Wrap the table in a shadcn `Card` if it cleans up the border/radius handling.

**Verified mapping reference** (current hand-rolled piece → shadcn target; ✅ = already installed):

| Current (in `InventoryView.tsx`) | Replace with | Installed? |
|---|---|---|
| `SummaryChips` — 3 inline-styled spans | `Badge` (destructive / secondary / outline) | add |
| `StatusBadge` — inline-styled span | `Badge` | add |
| Filter pills — `<button>` loop, manual active | `ToggleGroup` (single-select) | add |
| Main `<table>` | `Table` (`TableHeader/Row/Head/Body/Cell`) | add |
| `StocktakeModal` — fixed overlay div + manual z-index | `Dialog` | add |
| `HistoryPanel` — fixed slide-over div, manual `z-50 shadow-2xl` | `Sheet` (`side="right"`) | ✅ |
| `CountStepper` — inline buttons/input, glyphs | `Button` + `Input` + lucide `Check/X/Minus/Plus` | ✅ |
| History / New stock count / Back buttons | `Button` (`default`/`outline`/`ghost`) | ✅ |
| "No ingredients match" row | `Empty` | add (optional) |
| table container div border/radius | `Card` | add (optional) |

Leave alone (logic, no shadcn equivalent): `LiveClock`, `StockBar` (stays a `div` — `Progress` can't render the par tick), `getStockStatus`, all Supabase wiring.

### UX polish (do these too)
- **Sorting / ordering:** within the current `sort_order`, it'd help Lina if **below-par rows surfaced to the top** (or at least are never buried). Consider a default sort that floats `below` then `approaching` then `ok`, while keeping a stable order within each group. Keep it simple and client-side.
- **Touch targets:** this is tablet-first. The inline stepper buttons are currently `w-6 h-6` (24px) — too small for a finger. Bump interactive controls to a comfortable tap size (the shadcn `Button` `sm`/`icon` sizes are fine; don't go smaller than ~36px for touch).
- **Empty / loading:** replace the hand-rolled "No ingredients match" row with shadcn **`Empty`**; if you add any async skeleton, use the installed `skeleton`.
- **Bar legibility:** make the par tick obviously a *target marker* (a thin vertical line with enough contrast) and consider a tiny "on-hand vs par" label or tooltip on hover (`Tooltip`) so the bar isn't the only explanation.
- Keep `font-display` (Caveat) on the "Stock · today HH:MM" heading and the footer italic line.

### Hard constraints
- **Do not change** the database, the migration, the types, `stockStatus.ts`, or the server component's data fetching/conversion. UI only.
- **Do not hardcode** any data values (counts, "12 ingredients", times, the BELOW PAR numbers). Everything stays computed from live data exactly as now.
- **No raw hex colors** in the final components — only `var(--token)`. Add `--success`/`--warning` tokens rather than inlining greens/ambers.
- **No new external UI/chart library** beyond shadcn. Bars stay as divs.
- Keep components small and strictly typed. It's fine to split `InventoryView.tsx` into a few files under `src/components/inventory/` (e.g. `StockTable.tsx`, `StocktakeDialog.tsx`, `HistorySheet.tsx`) if it improves readability — but keep the public `InventoryView` export and its props identical so `page.tsx` needs no change.
- After building, run the build and confirm the route still shows as `ƒ (Dynamic)` and there are no type errors.

### Acceptance check (describe what you changed against each):
1. Header: only one primary button + one red badge stand out; approaching/healthy are quiet; actions separated from status.
2. All tables/badges/toggle-group/dialog/sheet/inputs/buttons are shadcn components, not hand-rolled.
3. `--success` and `--warning` tokens exist in light + dark; zero raw hex remain in the inventory components.
4. Below-par rows are easy to find without the whole table being noisy.
5. Behavior unchanged: inline adjust, stocktake (3 phases), history (per-row + global), live clock, cashier-from-auth, `router.refresh()` after writes.
