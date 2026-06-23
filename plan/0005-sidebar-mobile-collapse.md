# 0005 — Sidebar Not Collapsing on Mobile (root-cause fix)

**Do this BEFORE [0004-dashboard-mobile-responsive.md](0004-dashboard-mobile-responsive.md).** 0004 assumed the sidebar already turns into a mobile drawer — it doesn't. This plan fixes the actual cause; 0004's Task 1 then makes the open button work.

**Audience note:** Lina is non-technical. Result should be: on a phone the menu is hidden until you tap a menu button, then it slides in over the page. On desktop nothing changes.

---

## The bug

On mobile the manager sidebar renders as a **fixed full-width panel side-by-side with the content**, pushing the page off-screen (see inventory screenshot — "Stock · today" content is shoved to the right edge). It never collapses.

**Root cause:** [src/components/ui/ManagerSidebar.tsx](../src/components/ui/ManagerSidebar.tsx) line 69:

```tsx
<Sidebar collapsible="none" className="h-screen border-r border-border">
```

`collapsible="none"` tells shadcn "always render as a static panel, never collapse" — which also **disables the mobile off-canvas drawer entirely**. That's why there's no way to hide it on a phone, and why a `SidebarTrigger` would do nothing (the trigger only controls the off-canvas / icon modes).

---

## The fix

### 1. Switch the sidebar to off-canvas collapsing

In [src/components/ui/ManagerSidebar.tsx](../src/components/ui/ManagerSidebar.tsx):

```tsx
// before
<Sidebar collapsible="none" className="h-screen border-r border-border">
// after
<Sidebar collapsible="offcanvas" className="h-screen border-r border-border">
```

`offcanvas` is shadcn's default: a permanent rail on desktop, a slide-in `Sheet` drawer on mobile (< 768px).

- **First run `npx shadcn@latest docs sidebar`** to confirm, for the installed version: (a) the accepted `collapsible` values, (b) that `offcanvas` gives desktop-static / mobile-drawer, and (c) whether `h-screen` should stay (the component may manage its own height — keep `border-r border-border` regardless).
- The layout in [app/(manager)/layout.tsx](../app/(manager)/layout.tsx) already wraps everything in `SidebarProvider` + `SidebarInset`, so no layout change is needed — the provider supplies the open/close state the drawer uses.

### 2. Add the open button (mobile)

Without a trigger there's no way to open the drawer once it's hidden. Add a `md:hidden` top bar holding `SidebarTrigger` to **each** manager page (they don't share a page-level header):

- [app/(manager)/dashboard/page.tsx](../app/(manager)/dashboard/page.tsx) — covered by [0004](0004-dashboard-mobile-responsive.md) Task 1; do it there.
- [app/(manager)/inventory/page.tsx](../app/(manager)/inventory/page.tsx) — add the same bar (label "Inventory").
- [app/(manager)/users/page.tsx](../app/(manager)/users/page.tsx) — add the same bar (label "Users & roles").

Pattern (import `SidebarTrigger` from `@/components/ui/sidebar`, render as the first child of each page's root scroll container):

```tsx
<header className="md:hidden sticky top-0 z-10 flex items-center gap-2 -mx-4 px-4 py-2 mb-1
                   border-b backdrop-blur"
        style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
  <SidebarTrigger />
  <span className="font-bold" style={{ color: 'var(--foreground)' }}>Inventory</span>
</header>
```

Adjust the `-mx-4 px-4` negative-margin trick to match each page's existing horizontal padding so the bar spans full width. If a page already has a header element, just drop `SidebarTrigger` into it (wrapped in `md:hidden`) rather than adding a second bar.

---

## Verify

**At 375px (iPhone SE):**
- [ ] Sidebar is hidden on load — content uses the full width, no horizontal scroll.
- [ ] Tapping the menu button opens the sidebar as a drawer over the content.
- [ ] Tapping a nav item navigates and the drawer closes.
- [ ] Works on dashboard, inventory, AND users pages.

**At ≥1024px:**
- [ ] Sidebar is still a permanent left panel — desktop layout unchanged from before.

Use the `run`/`verify` skill or `npm run dev`, open each manager page, and screenshot at 375px.

## Files to touch

- `src/components/ui/ManagerSidebar.tsx` — `collapsible="none"` → `"offcanvas"`
- `app/(manager)/inventory/page.tsx` — mobile trigger bar
- `app/(manager)/users/page.tsx` — mobile trigger bar
- `app/(manager)/dashboard/page.tsx` — mobile trigger bar (via 0004)
