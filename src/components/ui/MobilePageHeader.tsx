import { SidebarTrigger } from '@/components/ui/sidebar'

/**
 * Sticky top bar shown on small screens for every manager page.
 * Holds the sidebar toggle + page title. Hidden on md+ (sidebar is always
 * visible there).
 *
 * `sticky -top-4` (not top-0): the parent <main> has `p-4`, so the bar is
 * pulled flush to the top with `-mt-4`/`-mx-4`. Pinning at -top-4 makes the
 * bar's background cover that padding strip instead of letting page content
 * peek through the gap above it when scrolling.
 */
export function MobilePageHeader({ title }: { title: string }) {
  return (
    <header
      className="md:hidden sticky -top-4 z-10 flex items-center gap-2 -mx-4 -mt-4 px-4 pt-4 pb-2 mb-1 border-b"
      style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
    >
      <SidebarTrigger />
      <span className="font-bold" style={{ color: 'var(--foreground)' }}>
        {title}
      </span>
    </header>
  )
}
