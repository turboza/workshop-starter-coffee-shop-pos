import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import { ManagerSidebar } from '@/src/components/ui/ManagerSidebar'

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager') redirect('/?denied=managers-only')

  const displayName = profile?.name ?? user.email ?? 'Manager'
  const role = profile?.role ?? 'manager'

  return (
    <TooltipProvider>
      <SidebarProvider className="h-screen overflow-hidden">
        <ManagerSidebar displayName={displayName} role={role} />
        <SidebarInset className="overflow-y-auto">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
