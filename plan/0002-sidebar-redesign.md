# Manager Sidebar — UX/UI Polish (Hand-off Prompt)

> Paste the **PROMPT** section below to Sonnet. No image needed — the file already exists.

---

## PROMPT

Improve the visual design of the manager sidebar. Read `CLAUDE.md` and `AGENTS.md` first and follow every convention (Next.js 16 APIs, design tokens, **no custom Tailwind color classes** — use the existing `--sidebar-*` / `--primary` CSS variables and their `bg-*` / `text-*` token classes only).

**File to edit:** `src/components/ui/ManagerSidebar.tsx`
**Primitive it uses:** `components/ui/sidebar.tsx` (shadcn) — read it to see how `SidebarMenuButton` applies `isActive`, hover, and `data-active` styles before changing anything.

### The problems (what's wrong today)

1. **Active item is too loud.** The active nav item uses a solid orange fill (`bg-primary text-primary-foreground`). On a white sidebar this is a heavy block that fights the content area. We want a calmer "you are here" indicator, not a billboard.
2. **Hover and active look identical / inconsistent.** Nav items have no defined hover, so they fall back to the primitive's gray hover — but the active item's inline `hover:bg-primary` override makes hovering the *active* Dashboard item stay solid orange, while hovering the **Sign out** button in the footer goes gray. Same gesture, two different colors. Active and hover should be visually distinct from each other, and hover should be consistent across every interactive item (nav links, "Back to till", and "Sign out").

### Design direction (what we want instead)

Keep the **white background** — Lina likes it. Make the active and hover states a coherent system:

- **Active item:** subtle, not a solid block. Use a **tinted background** (a soft, low-opacity orange wash) with **orange text + orange icon** so it reads clearly as selected without shouting. Add a **small orange accent bar on the left edge** (a 3px vertical strip) as the primary "you are here" cue — this is the standout signal instead of a full fill. Use `font-medium` on the active label.
  - Tint: derive from the brand color, e.g. `bg-primary/10` (or `/12`) for the wash; text/icon `text-primary`. Confirm Tailwind v4 alpha-on-token syntax works against the `--primary` token; if not, add a dedicated `--sidebar-active` / `--sidebar-active-foreground` pair in `globals.css` (both light and dark blocks) and use those.
- **Hover (any interactive item, active or not):** a **neutral gray wash** (the existing `--sidebar-accent` / `bg-sidebar-accent`). Apply it uniformly to nav links, "Back to till", and "Sign out" so every hover feels the same.
  - Hovering the **active** item should NOT turn it solid orange. Remove the `hover:bg-primary hover:text-primary-foreground` override. Either let the active tint deepen slightly on hover (e.g. `/10` → `/15`) or just keep the active tint steady — pick whichever looks calmer. The key rule: **active ≠ hover color.**
- **Icons:** muted gray (`text-muted-foreground`) by default; orange (`text-primary`) only when the item is active. Make sure icon color follows the item state, not always-on.
- **Spacing/rhythm:** verify comfortable vertical padding and a consistent gap between icon and label. Group labels ("Operate", "Catalog") should stay quiet — small, uppercase, `text-muted-foreground`.

### Hard rules

- Only **one** item is active at a time — it's driven by `pathname === href`. (In the current mockup two items look orange because both got the loud fill; the new subtle treatment plus the single-source-of-truth pathname check fixes this. Double-check the matching logic so e.g. `/inventory` doesn't also light up another route.)
- Active and hover must be **two different colors** and the hover treatment must be **identical** across all clickable rows including Sign out.
- No new color hex values inline — go through tokens. If you need a new token, add it to **both** the `:root` and `.dark` blocks in `app/globals.css` following the existing `oklch(...)` style.
- The active accent bar: implement with a pseudo-element or an absolutely-positioned `span` inside the button; make sure `SidebarMenuButton`'s layout (`relative`, overflow) allows it. Don't break the rounded corners.

### Acceptance check

After the change, eyeball it at `/dashboard` and `/inventory`:
- Active item: soft orange tint + left accent bar + orange text/icon. Reads clearly but doesn't dominate.
- Exactly one item active per route.
- Hovering Dashboard, Inventory, Back to till, and Sign out all produce the **same** gray wash.
- Hovering the active item does not flip it to solid orange.
- Light and dark mode both look correct (check the dark `--sidebar-*` tokens).

Run the app, navigate between Dashboard and Inventory, and confirm the four points above before finishing.
