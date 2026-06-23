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

function NavItem({ label, href, icon: Icon, isActive }: {
  label: string
  href: string
  icon: React.ElementType
  isActive: boolean
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={href} />}
        isActive={isActive}
        className={[
          'relative',
          isActive
            ? 'data-active:bg-sidebar-active data-active:text-sidebar-active-foreground data-active:hover:bg-sidebar-active'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        ].join(' ')}
      >
        {isActive && (
          <span
            aria-hidden
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-sidebar-active-foreground"
          />
        )}
        <Icon className={isActive ? 'text-sidebar-active-foreground' : 'text-muted-foreground'} />
        {label}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function ManagerSidebar({ displayName, role }: Props) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" className="h-screen border-r border-border">
      <SidebarHeader className="p-4 gap-3">
        <div>
          <p className="font-bold text-xl text-foreground">Lina&apos;s POS</p>
          <p className="text-xs mt-0.5 text-muted-foreground">{displayName} · {role}</p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/" />}
              className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <ArrowLeftIcon className="text-muted-foreground" />
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
              {NAV_OPERATE.map(({ label, href, icon }) => (
                <NavItem
                  key={href}
                  label={label}
                  href={href}
                  icon={icon}
                  isActive={pathname === href}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Catalog</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_CATALOG.map(({ label, href, icon }) => (
                <NavItem
                  key={href}
                  label={label}
                  href={href}
                  icon={icon}
                  isActive={pathname === href}
                />
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
