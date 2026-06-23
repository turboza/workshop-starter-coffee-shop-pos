# Dashboard — Mobile Responsive Pass

**Goal:** Make the manager Dashboard usable on a phone (≈375px wide). Right now the layout was built tablet/desktop-first and several pieces break or overflow on small screens. This plan is a handoff for Sonnet to implement.

**Audience note:** Lina (the shop owner) is non-technical. Keep the visual result clean and obvious — no horizontal scrolling, no clipped numbers, easy tap targets.

> **Prerequisite: do [0005-sidebar-mobile-collapse.md](0005-sidebar-mobile-collapse.md) first.** The sidebar currently does NOT collapse on mobile (`collapsible="none"`), so the mobile trigger in Task 1 below has nothing to toggle until 0005 switches it to `offcanvas`. 0005 also adds the trigger to the inventory/users pages.

---

## What's broken on mobile today (observed)

1. **Sidebar trigger (covered by 0005).** Once the sidebar collapses (0005), the dashboard needs a `SidebarTrigger` so the user can open it — Task 1 below adds that. Until 0005 lands, the sidebar renders full-width and pushes the dashboard off-screen.
2. **No mobile top bar.** The dashboard ([app/(manager)/dashboard/page.tsx](../app/(manager)/dashboard/page.tsx)) starts straight into content. There's no header strip to hold the menu button.
3. **Stat cards too cramped.** [DashboardLive.tsx](../src/components/dashboard/DashboardLive.tsx) uses `grid-cols-2` always, and [StatCard.tsx](../src/components/dashboard/StatCard.tsx) renders the value at `text-4xl`. Two `฿`-prefixed 4xl numbers side-by-side at 375px overflow / wrap badly.
4. **Top products rows overflow.** [TopProducts.tsx](../src/components/dashboard/TopProducts.tsx) hardcodes `w-28` for the product name + a flex bar + fixed columns. On narrow screens the bar gets squeezed to near-zero. The TODAY/WEEK/MONTH toggle is also a hand-rolled button group.
5. **Header + Till link cramped.** The page header row (`flex items-start justify-between`) puts the greeting (`text-3xl`) next to the live badge + "← Till" link; on mobile this is tight.

---

## Design approach

Use **shadcn components we already have installed** (`sidebar`, `card`, `toggle-group`, `badge`, `separator`, `button`). Do **not** introduce new raw styled divs where a component exists. Note this repo keeps custom CSS-variable styling (`var(--card)`, `var(--foreground)`, etc.) — match the surrounding pattern; don't convert everything to Tailwind semantic tokens in this pass. The shadcn rule of "use the component" applies mainly to the **sidebar trigger** and **toggle-group**.

Breakpoints already in use: Tailwind defaults (`md:` = 768px). The sidebar's own mobile breakpoint is 768px (shadcn default). Treat **< md** as "phone".

---

## Tasks

### 1. Add a mobile top bar with a sidebar trigger  ← highest priority

In [app/(manager)/dashboard/page.tsx](../app/(manager)/dashboard/page.tsx), add a sticky top bar that only shows on mobile and holds the `SidebarTrigger`.

- Import `SidebarTrigger` from `@/components/ui/sidebar`.
- Render, as the first child of `<main>`:

```tsx
<header className="md:hidden sticky top-0 z-10 flex items-center gap-2 -mx-4 px-4 py-2 mb-1
                   border-b backdrop-blur"
        style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
  <SidebarTrigger />
  <span className="font-bold" style={{ color: 'var(--foreground)' }}>Dashboard</span>
</header>
```

- `SidebarTrigger` is the canonical shadcn way to toggle the off-canvas sheet — do not build a custom hamburger. (0005 adds the same trigger to inventory/users; here just do the dashboard.)
- Verify tapping it opens the sidebar sheet on a narrow viewport — this only works after 0005 sets the sidebar to `collapsible="offcanvas"`.

### 2. Stat cards: 1-up on the smallest screens, smaller value text

- In [DashboardLive.tsx](../src/components/dashboard/DashboardLive.tsx), change the grid from `grid-cols-2 lg:grid-cols-4` to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`. (`sm` = 640px, so phones in portrait get a single column; small landscape / tablet get 2-up.)
- In [StatCard.tsx](../src/components/dashboard/StatCard.tsx), make the value responsive: `text-3xl md:text-4xl` instead of `text-4xl`. Keep everything else.

### 3. Top products: responsive row layout + ToggleGroup

In [TopProducts.tsx](../src/components/dashboard/TopProducts.tsx):

- **Replace the hand-rolled period buttons** with the installed `ToggleGroup` (`@/components/ui/toggle-group`):

```tsx
<ToggleGroup
  type="single"
  value={period}
  onValueChange={(v) => v && setPeriod(v as Period)}
  variant="outline"
  size="sm"
>
  <ToggleGroupItem value="TODAY">Today</ToggleGroupItem>
  <ToggleGroupItem value="WEEK">Week</ToggleGroupItem>
  <ToggleGroupItem value="MONTH">Month</ToggleGroupItem>
</ToggleGroup>
```

  - `onValueChange` can fire with `""` when the active item is re-tapped — the `v && ...` guard prevents clearing the selection.
  - Read [the toggle-group docs](https://ui.shadcn.com/docs/components/base/toggle-group.md) via `npx shadcn@latest docs toggle-group` first to confirm the API for the installed `base` (not radix) variant before writing it. Check whether `variant`/`size` belong on the group or the items in this version.
- **Fix the row width:** the product name's fixed `w-28` is the overflow culprit. Make it flexible:
  - Name span: `w-28` → `min-w-0 flex-1 truncate` (let it shrink and ellipsis).
  - The bar wrapper: give it a fixed-ish responsive width instead of `flex-1`, e.g. `w-20 sm:w-32 md:flex-1`, so the name has room on narrow screens. Pick whatever reads cleanly — the key is **name truncates, bar never collapses to zero, count stays visible**.
- Header row: when the title + toggle don't fit on one line at 375px, allow wrap: `flex flex-wrap items-center justify-between gap-2`.

### 4. Hourly chart: keep, just verify

[HourlyChart.tsx](../src/components/dashboard/HourlyChart.tsx) already uses `flex-1 min-w-0` bars, so 14 bars compress fine. Two small touches:

- The hover tooltip (`group-hover`) is useless on touch — that's acceptable (leave it), but ensure the chart isn't the *only* way to read a number. It isn't (stat cards cover totals), so no change needed.
- Confirm the `h-24` / fixed `80px` inner height still looks right on mobile; reduce label `fontSize` only if cramped. Likely no change.

### 5. Page header row

In [app/(manager)/dashboard/page.tsx](../app/(manager)/dashboard/page.tsx), the greeting/badge row:

- Greeting `text-3xl` ([DashboardHeader.tsx](../src/components/dashboard/DashboardHeader.tsx)) → `text-2xl md:text-3xl`.
- The "← Till" link is already `md:hidden`. With the new mobile top bar (task 1) holding the sidebar trigger, decide: either keep "← Till" in the header row, or move it into the sidebar nav and drop it here. **Recommendation:** keep it where it is for now (one less moving part); just ensure the row wraps gracefully: add `flex-wrap gap-2` to the `flex items-start justify-between` container.

---

## Out of scope (don't do in this pass)

- Redesigning the sidebar itself (separate plan: `sidebar-redesign.md`).
- Switching the sidebar to collapse + adding the trigger to inventory/users pages — owned by [0005](0005-sidebar-mobile-collapse.md).
- Converting CSS-variable inline styles to Tailwind tokens.
- Any data/query changes.

---

## Verification checklist

Run the app and check at **375px** (iPhone SE) and **768px**:

- [ ] Sidebar opens via the trigger on mobile; closes after navigating.
- [ ] No horizontal page scroll at 375px.
- [ ] Stat card numbers fully visible, not clipped or overlapping (1 column on phone).
- [ ] Top-products rows: name truncates with "…", bar is visible, count visible; toggle works and doesn't deselect on re-tap.
- [ ] Header greeting doesn't collide with the badge/Till link.
- [ ] Desktop (≥1024px) is unchanged from before — this is additive/responsive only.

Use the `verify` or `run` skill (or `npm run dev`) to load `/dashboard` and eyeball it. Take a screenshot at 375px to confirm.

## Files to touch

- `app/(manager)/dashboard/page.tsx` — mobile top bar, header wrap, greeting size
- `src/components/dashboard/DashboardLive.tsx` — stat grid columns
- `src/components/dashboard/StatCard.tsx` — responsive value text
- `src/components/dashboard/TopProducts.tsx` — ToggleGroup + row widths
- `src/components/dashboard/DashboardHeader.tsx` — greeting size
- (verify only) `src/components/dashboard/HourlyChart.tsx`
