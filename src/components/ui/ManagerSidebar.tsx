'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboardIcon, UsersIcon, PackageIcon, ArrowLeftIcon } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { LogoutButton } from '@/src/components/ui/LogoutButton'

interface Props {
  displayName: string
  role: string
}

const NAV_OPERATE = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
  { label: 'Users & roles', href: '/users', icon: UsersIcon },
]

const NAV_CATALOG = [
  { label: 'Inventory', href: '/inventory', icon: PackageIcon },
]

export function ManagerSidebar({ displayName, role }: Props) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="none" className="h-screen border-r border-border">
      <SidebarHeader className="p-4 gap-3">
        <div>
          <p className="font-bold text-xl text-foreground">Lina&apos;s POS</p>
          <p className="text-xs mt-0.5 text-muted-foreground">{displayName} · {role}</p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/" />} className="text-muted-foreground">
              <ArrowLeftIcon />
              Back to till
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_OPERATE.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    render={<Link href={href} />}
                    isActive={pathname === href}
                    className={pathname === href ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' : ''}
                  >
                    <Icon />
                    {label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Catalog</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_CATALOG.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    render={<Link href={href} />}
                    isActive={pathname === href}
                    className={pathname === href ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' : ''}
                  >
                    <Icon />
                    {label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  )
}
