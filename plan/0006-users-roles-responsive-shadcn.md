# 0006 — Users & Roles: Mobile Responsive + shadcn Components

**Goal:** Make the **Users & roles** page ([app/(manager)/users/page.tsx](../app/(manager)/users/page.tsx) + [src/components/users/UsersTable.tsx](../src/components/users/UsersTable.tsx)) usable on a phone, and replace the hand-rolled UI with the shadcn components we already have. Handoff for Sonnet.

**Audience note:** Lina is non-technical. Result should be clean and tappable — no clipped buttons, no 3-line wrapping dates, no horizontal scroll.

> **Sonnet: when you touch anything shadcn in this plan, invoke the `shadcn` skill first** (it gives project context + the installed component APIs). Also run `npx shadcn@latest docs <component>` before using a component to confirm the installed API — this repo uses the shadcn **`base`** variant, not radix, so props differ from memory. Keep the repo's existing CSS-variable inline-style pattern (`var(--foreground)`, etc.); don't convert those to Tailwind semantic tokens.

---

## What's broken on mobile today (observed at ~375px)

The user-row layout in [UsersTable.tsx](../src/components/users/UsersTable.tsx) (`UserGroup`) is a **4-column CSS grid** hardcoded to `gridTemplateColumns: '1fr 1fr 100px 60px'` (lines 170 & 187). At phone width:

1. **"Joined" date wraps to 3 lines** ("15 / Jun / 2026") because its `1fr` column is too narrow.
2. **Role badge + Edit button get crushed**, and per the screenshot the **Edit button is clipped off the right edge** of the card.
3. The grid forces all four columns to coexist even when there's no room — there's no mobile reflow.

Everything else (page header, roles legend) reflows acceptably; the **table rows are the whole job here.**

---

## Plan

### A. Replace the hand-rolled "table" with shadcn — responsive by design

The current `UserGroup` builds a fake table out of `grid` divs. Replace with a layout that **stacks on mobile, tabulates on desktop**. Two acceptable approaches — **prefer A1**:

**A1 (recommended): shadcn `Card` list on mobile, `Table` on desktop.**
- Wrap each group (Managers / Cashiers) in a shadcn **`Card`** (`@/components/ui/card`) instead of the raw `rounded-2xl` div.
- Inside, render **two layouts** controlled by Tailwind breakpoints:
  - **`< md` (mobile): a stacked list.** One row per user as a flex column: name + "you" tag on top, email under it, then a row with the join date (left) and the role `Badge` + Edit `Button` (right). No grid — let it wrap naturally. This is what fixes the screenshot.
  - **`>= md` (desktop): the shadcn `Table`** (`@/components/ui/table` — `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`). Columns: Name/Email · Joined · Role · (Edit). This preserves the current desktop look using the real component.
  - Use `hidden md:block` / `md:hidden` to switch between them (render data once, two presentations).

**A2 (fallback if A1 is too much):** keep a single layout but make the grid responsive — stack to one column under `md` (`grid-cols-1 md:grid-cols-[...]`) and drop the fixed `100px 60px` tracks on mobile. Still swap the raw elements for shadcn `Badge`/`Button`/`Card` per section B.

### B. Swap raw elements for installed shadcn components

All already installed (`ls components/ui` confirms): `card`, `table`, `badge`, `button`, `dialog`, `separator`.

- **Role tag** (lines 209–218) → shadcn **`Badge`** (`@/components/ui/badge`). Manager = default/primary variant, Cashier = `secondary` or `outline`. Note there's also a project `Badge` at `@/src/components/ui/Badge` with `new|void|live` variants — **use the shadcn one** (`@/components/ui/badge`) here, it's the general-purpose one.
- **Edit button** (lines 221–227) → shadcn **`Button`** (`@/components/ui/button`), `variant="ghost"` or `"outline"`, `size="sm"`.
- **Cancel / Save** in the modal (lines 123–137) → shadcn **`Button`** (`outline` for Cancel, default for Save; keep the `busy` disabled + "Saving…" text).
- **Group cards / roles legend** raw `rounded-2xl` divs → shadcn **`Card`** where it reads cleanly (the roles legend in [users/page.tsx](../app/(manager)/users/page.tsx) lines 38–56 is optional but nice).

### C. Convert the role-change modal to shadcn `Dialog`

`RoleModal` (lines 15–142) is a hand-rolled fixed-overlay modal. Replace with shadcn **`Dialog`** (`@/components/ui/dialog` — already installed):
- `Dialog` + `DialogContent` + `DialogHeader` + `DialogTitle` ("Change role for {name}") + `DialogFooter` (Cancel / Save buttons).
- Drive `open` from the existing `editing` state in `UsersTable` (open when `editing != null`, `onOpenChange` → `setEditing(null)`).
- **Radio options:** the two role choices (lines 75–115) are a radio group. Install and use shadcn **`radio-group`** (`npx shadcn@latest add radio-group` — NOT currently installed) for proper a11y/keyboard, OR keep them as styled `Button`s if radio-group's base-variant API is fiddly. Either is fine; prefer `radio-group`.
- Keep all existing behavior: the self-demotion `confirm()` guard (lines 33–36), the error message display, `router.refresh()` on save.

### D. Page-level header — already fine

[users/page.tsx](../app/(manager)/users/page.tsx) already has the mobile `SidebarTrigger` bar (from 0005) and the header/legend reflow OK. Only touch the legend if doing the optional `Card` swap in B. The `h1` is `text-3xl` — optionally make it `text-2xl md:text-3xl` to match the dashboard treatment from [0004](0004-dashboard-mobile-responsive.md).

---

## Out of scope

- Adding/removing/inviting users (no create/delete flow today — don't build one).
- Changing the data query or the managers-first / cashiers grouping logic.
- The dashboard/inventory pages (separate plans).

---

## Verify

Use the `run` or `verify` skill (or `npm run dev`), open `/users`:

**At 375px:**
- [ ] Each user row is fully visible — name, email, join date, role badge, and **Edit button all on-screen** (no clipping, no 3-line date).
- [ ] Tapping Edit opens the role dialog; it's centered and fits the screen; Cancel/Save and role options all reachable.
- [ ] Changing a role saves and the list refreshes; self-demotion still shows the warning.
- [ ] No horizontal page scroll.

**At ≥1024px:**
- [ ] Desktop shows the tabular layout (Name/Email · Joined · Role · Edit) — visually equivalent to before, now built on shadcn `Table`.

## Files to touch

- `src/components/users/UsersTable.tsx` — responsive rows (A), shadcn Badge/Button/Card (B), Dialog modal (C)
- `app/(manager)/users/page.tsx` — optional Card legend + `h1` size (B/D)
- maybe `components/ui/radio-group.tsx` — new, via `npx shadcn@latest add radio-group` (C)
