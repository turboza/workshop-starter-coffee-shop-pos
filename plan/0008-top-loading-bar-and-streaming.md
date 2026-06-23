# 0008 — Top loading bar + faster manager pages (Suspense streaming)

> **For the implementing agent:** This plan is self-contained. Read it top to bottom before
> editing. Read [`DESIGN.md`](../DESIGN.md) before any UI change — **no raw hex/oklch in
> components**, bar color comes from `var(--primary)`. This Next.js version is NOT the one in
> your training data; the conventions below were verified against
> `node_modules/next/dist/docs/`. No new npm dependencies are needed.

## Goal

Two things, both about page navigation between the manager pages (`/dashboard`,
`/inventory`, `/users`):

1. **A thin top loading bar** — a slim animated line across the very top of the screen
   (like GitHub/YouTube) that appears the instant a sidebar link is clicked and disappears
   when the new page is ready. This is *visual feedback* so a click never feels ignored.
2. **Actually faster navigation** via `<Suspense>` streaming — the page shell (header +
   layout) paints instantly and the database-backed content streams in a beat later, instead
   of the whole screen blocking on Supabase before anything shows.

The data stays **truly live** — we keep `force-dynamic` and add **no caching**. We are only
changing *when* things appear, not how fresh they are.

## Why these decisions (already settled with the user)

| Decision | Choice |
|---|---|
| Indicator style | Thin top bar (not a full-page skeleton) |
| Library for the bar | **None** — use the native `useLinkStatus` hook from `next/link` |
| Speed approach | `<Suspense>` streaming only — **no** cache window (no staleness) |
| Scope | All three manager pages: dashboard, inventory, users |

## Current state (verified)

- Navigation is via `<Link>` in [`ManagerSidebar.tsx`](../src/components/ui/ManagerSidebar.tsx)
  — `NavItem` links + the "Back to till" link.
- All three manager pages (`app/(manager)/{dashboard,inventory,users}/page.tsx`) are
  `export const dynamic = 'force-dynamic'` and `await` Supabase queries **at the top of the
  page body**, so nothing renders until the queries finish. The dashboard is slowest (two
  parallel queries: 48h orders + 30 days of order_items).
- The shared [`(manager)/layout.tsx`](../app/(manager)/layout.tsx) also `await`s auth +
  profile, but it renders the sidebar shell — that part is fast and stays as-is.
- **No `loading.tsx` files exist.**
- shadcn `skeleton` primitive is already installed at `components/ui/skeleton.tsx`.

## Key API facts (from the Next.js docs in node_modules — do not skip)

- **`useLinkStatus`** (`import { useLinkStatus } from 'next/link'`, added v15.3.0) returns
  `{ pending: boolean }` — `true` from click until the history entry updates, `false` after.
  - It **must be rendered inside a descendant of a `<Link>`** component. It cannot be used at
    arbitrary places in the tree.
  - "When clicking multiple links in quick succession, only the last link's pending state is
    shown" — fine for us.
  - If the destination is already prefetched, the pending phase may be **skipped entirely**.
    Our pages are dynamic and currently have no `loading.js`, so prefetch won't make them
    instant — the pending state will fire. (After Part B adds streaming, transitions get
    faster but the bar still shows during the stream.)
  - Docs guidance: avoid layout shift and avoid flashing on fast navigations — start the
    animation invisible with a short (~100ms) delay so quick transitions don't flicker.
- **`<Suspense>` streaming**: move dynamic `await` **out of the page body** into a child
  async server component, wrap that child in `<Suspense fallback={<Skeleton/>}>`. Everything
  *above* the boundary (the page header/shell) becomes the static shell and paints instantly.
  Sibling `<Suspense>` boundaries stream independently. Keep `force-dynamic`.

---

## Part A — Thin top loading bar (no new dependency)

### A1. New component: `src/components/ui/TopLoadingBar.tsx`

A `'use client'` component that reads `useLinkStatus()` and renders a fixed bar at the very
top of the viewport.

- `'use client'` directive at the top; `import { useLinkStatus } from 'next/link'`.
- Render a `position: fixed; top: 0; left: 0` container, `z-index` above the sidebar
  (sidebar mobile top bars use `z-10`; use `z-50`), full width, ~3px tall.
- Inside, a bar element colored `bg-primary` (token — DESIGN.md compliant) that animates a
  left-to-right progress sweep while `pending` is true, then fades out.
- **Anti-flash**: keep the element always mounted but `opacity: 0` / hidden by default; when
  `pending`, after a ~100ms delay, fade in and run the sweep animation. This avoids flicker on
  fast navigations and avoids layout shift (per docs).
- The animation can be a Tailwind/`globals.css` keyframe (e.g. translateX from `-100%` →
  near `100%`, or a width grow `0 → 90%`). Add the keyframe to `app/globals.css` if needed —
  do NOT inline raw colors; use the `--primary` token.

> **Why fixed-position even though the hook lives inside a Link:** `useLinkStatus` only works
> inside a `<Link>` descendant, but a `position: fixed` element visually escapes to the top of
> the screen regardless of where it sits in the DOM. So we render `<TopLoadingBar/>` *inside*
> each sidebar Link; visually it's a single bar pinned to the top.

### A2. Wire it into `ManagerSidebar.tsx`

- In `NavItem`, render `<TopLoadingBar />` inside the `<SidebarMenuButton render={<Link/>}>`
  (it must be a descendant of the `Link`). Because only the *clicked* link is pending, only
  that one drives the bar — and the docs say rapid clicks show only the last one, so multiple
  copies are safe.
- Also add it inside the "Back to till" link in `SidebarHeader` so navigating back to the
  till shows the bar too.
- Visual check: confirm the bar appears for all four links (Dashboard, Users, Inventory, Back
  to till) and never causes layout shift in the sidebar (it's fixed-position, so it shouldn't).

> Note: `useLinkStatus` returns `{ pending: false }` for already-prefetched static routes.
> The till route (`/`) may prefetch; if the bar never shows for "Back to till", that's
> expected behavior, not a bug.

---

## Part B — Suspense streaming for the three manager pages

For **each** of `dashboard`, `inventory`, `users`, apply the same refactor. Keep
`export const dynamic = 'force-dynamic'` on every page.

### Pattern (do this per page)

1. **Move the Supabase fetching into a child async server component.** Create it co-located
   with the page (e.g. `app/(manager)/dashboard/DashboardData.tsx`, or under
   `src/components/<area>/` to match where that area's components live — match the existing
   location convention for each area). The child does the `await supabase...` work and renders
   the data-driven UI (the existing `DashboardLive`/`TopProducts`/`LiveFeed`,
   `InventoryView`, `UsersTable`, etc.).
2. **The page body renders only the static shell** — the mobile header bar (with
   `SidebarTrigger`), the page heading, and any static legend (e.g. the Users "Roles &
   permissions" card is static — keep it in the shell so it paints instantly). Then wrap the
   data component in `<Suspense fallback={<Skeleton .../>}>`.
3. **Skeleton fallback**: use the shadcn `Skeleton` primitive
   (`import { Skeleton } from '@/components/ui/skeleton'`). Match the *dimensions* of the real
   content to avoid layout shift (CLS) — e.g. for the dashboard, a row of stat-card-sized
   skeletons + a chart-height skeleton block. A small co-located `*Skeleton.tsx` per page is
   fine.

### Page-specific notes

- **Dashboard** (`app/(manager)/dashboard/page.tsx`): currently
  `const [orders, rawItems] = await Promise.all([...])` then renders three sections. Move the
  fetch + the `DashboardLive`/`TopProducts`/`LiveFeed` block into `DashboardData`. Keep the
  header row (`DashboardHeader`, live `Badge`, mobile Till link) in the shell. Optional: give
  `TopProducts` and `LiveFeed` their *own* sibling `<Suspense>` boundaries so they stream
  independently — only do this if it's clean; a single boundary around all data is acceptable
  and simpler.
- **Inventory** (`app/(manager)/inventory/page.tsx`): move the two queries + unit conversion +
  `<InventoryView/>` into `InventoryData`. Keep the mobile header in the shell. Skeleton =
  a table-shaped block.
- **Users** (`app/(manager)/users/page.tsx`): move the profiles query + `<UsersTable/>` into
  `UsersData`. **Keep** the heading and the static "Roles & permissions" `Card` in the shell
  (they don't need data). Note the page also reads `user!.id` for `currentUserId` — that
  `await supabase.auth.getUser()` must move into `UsersData` too (don't await it in the shell,
  or the shell blocks). Skeleton = a table-shaped block.

> **Gotcha — don't re-block the shell.** The whole point is that the page function itself must
> not `await` any Supabase call. If any `await` stays in the page body above the `<Suspense>`,
> the shell won't stream. All awaits live inside the child data components.

> **Layout auth stays as-is.** `(manager)/layout.tsx` still does its auth/role redirect — that
> protection must run before showing manager UI, so leave it blocking. It's fast (auth +
> single profile row) and renders the sidebar, which is the shell the user sees first anyway.

---

## Acceptance check

1. `npm run build` — confirm all three manager pages still show `ƒ (Dynamic)` (NOT `○ Static`)
   in the build output. `force-dynamic` must remain.
2. Run the app, log in as a manager, click between Dashboard / Inventory / Users:
   - A thin bar in the primary color sweeps across the top on each click.
   - The page header + skeleton appear almost immediately; real data fills in after.
   - No layout jump when skeletons swap to real content (dimensions match).
   - Fast/cached navigations don't leave a stuck or flickering bar.
3. Dark mode: the bar (primary token) and skeletons look right in `.dark` too.
4. No raw hex/oklch added to any component (DESIGN.md).

## Out of scope (explicitly not doing now)

- No caching / `revalidate` window — data stays live (user decided).
- No `nprogress` or other progress-bar library — native `useLinkStatus` only.
- No changes to the Till screen's internal navigation (payment → receipt etc.).
