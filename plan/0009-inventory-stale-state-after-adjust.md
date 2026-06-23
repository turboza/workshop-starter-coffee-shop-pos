# 0009 — Inventory: History & counts don't update after adjusting stock (needs full reload)

> **For the implementing agent:** This plan is self-contained. Read it top to bottom before
> editing. Read [`DESIGN.md`](../DESIGN.md) before any UI change — **no raw hex/oklch in
> components**. This Next.js version is NOT the one in your training data; `useRouter` comes
> from `next/navigation` and `router.refresh()` behaviour was verified against
> `node_modules/next/dist/docs/`. No new npm dependencies are needed.

## The bug (in plain language)

On the Inventory page, when you adjust an ingredient's count (or run a stock count), the
**number in the table updates**, but two things **stay frozen until you do a full browser
reload**:

1. The **History** panel (the side sheet) — it does not show the change you just made.
2. The **"Last full stocktake"** footer line — same problem.

Think of it like a spreadsheet where you typed a new value into one cell, but the "recent
changes" log on another tab kept showing yesterday's numbers until you closed and reopened
the whole file.

## Root cause (verified in code)

In [`InventoryView.tsx`](../src/components/inventory/InventoryView.tsx):

```js
// line ~415
const [ingredients, setIngredients] = useState(initialIngredients) // has a setter — gets updated
const [adjustments]                 = useState(initialAdjustments) // NO setter — frozen forever
```

`useState(initialValue)` reads its argument **only on the first mount**. After that, React
ignores the prop completely — a new `initialAdjustments` prop on a later render does nothing.

The flow today:

1. `handleAdjust` / `handleStocktake` write to Supabase, then call `router.refresh()`
   (lines ~476 and ~501).
2. `router.refresh()` re-runs the server component
   ([`InventoryData.tsx`](../app/(manager)/inventory/InventoryData.tsx)), which re-queries
   Supabase and re-renders `<InventoryView>` with **fresh** `ingredients` AND `adjustments`
   props.
3. But `adjustments` is held in `useState` with no setter, so the refreshed prop is
   **discarded**. The History sheet and the footer keep rendering the stale first-mount data.
4. `ingredients` *appears* to update only because `handleAdjust` also calls `setIngredients(...)`
   optimistically (line ~472) — that local update is what you see, not the refresh.

A full page reload re-mounts the component, so `useState` re-reads the (now current) props,
which is why a reload "fixes" it.

> Note: `ingredients` is updated **twice** by design — an optimistic `setIngredients` (so the
> typed count shows instantly) plus the `router.refresh()` (the authoritative server value).
> That's intentional and the fix below keeps it. The problem is only that `adjustments`
> receives **neither** update.

## The fix — two options (pick one, recommend Option A)

### Option A (recommended): sync local state from props after every refresh

Keep `router.refresh()` as the single source of truth, and make **both** pieces of state
follow the incoming props. This is the smallest, most robust change and keeps the server as
the authority (no risk of optimistic state drifting from the DB).

In [`InventoryView.tsx`](../src/components/inventory/InventoryView.tsx):

1. Give `adjustments` a setter:
   ```js
   const [ingredients, setIngredients] = useState(initialIngredients)
   const [adjustments, setAdjustments] = useState(initialAdjustments)
   ```

2. Add an effect that re-syncs local state whenever the props change (i.e. after
   `router.refresh()` streams new data in):
   ```js
   useEffect(() => {
     setIngredients(initialIngredients)
     setAdjustments(initialAdjustments)
   }, [initialIngredients, initialAdjustments])
   ```
   > `useEffect` is already imported (line 3). The server passes **new array identities** on
   > each refresh, so the dependency comparison fires correctly.

3. **Leave the optimistic `setIngredients(...)` block inside `handleAdjust` (lines ~472–474)
   exactly as it is — do not remove it.** It makes the typed count appear instantly instead
   of flickering back to the old value during the `router.refresh()` round-trip. The effect
   in step 2 reconciles it with the server data when the refresh lands. (Steps 1 and 2 are
   the actual fix; step 3 is just a "don't touch this" warning.)

That's the whole fix. The History sheet and footer read from `adjustments`, which now
updates on every refresh.

### Option B (alternative): optimistic update for adjustments too

Instead of relying on the refresh, build the new adjustment row in `handleAdjust` /
`handleStocktake` and prepend it to `adjustments` via a setter, mirroring how `ingredients`
is already updated optimistically. Downsides: you have to hand-build the row (id, timestamp,
cashier) to match the DB shape, and it can drift from what the server actually stored. Only
choose this if you want History to feel instant **and** you're also removing
`router.refresh()`. Not recommended — more code, more ways to be wrong.

## Files to touch

- [`src/components/inventory/InventoryView.tsx`](../src/components/inventory/InventoryView.tsx)
  — the only file. (`useEffect` already imported.)

No server, DB, migration, or type changes needed.

## How to verify (manual)

1. Open `/inventory`. Click **History** — note the topmost entry.
2. Tap a count, change it, hit the check. The table count updates (as before).
3. Open **History** again **without reloading** — your change should now be at the top
   with the right delta, cashier, and "just now".
4. Run a **New stock count**, save a couple of changes. Without reloading: History shows the
   new `stocktake` rows, and the **"Last full stocktake"** footer shows the current
   date/time + your name.
5. Reload the page — nothing should change (state already matched the DB).

## Out of scope

- The thin top loading bar / Suspense streaming work — that's
  [`0008`](0008-top-loading-bar-and-streaming.md). This plan is independent and can land
  before or after it.
- Real-time updates from *other* devices (Supabase realtime subscriptions). This fix only
  covers the current user's own adjustments reflecting immediately. Multi-device live sync is
  a separate, larger feature.
