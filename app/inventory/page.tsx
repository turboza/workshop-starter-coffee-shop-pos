export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import { LogoutButton } from '@/src/components/ui/LogoutButton'
import { InventoryView } from '@/src/components/inventory/InventoryView'
import { Ingredient, StockAdjustment } from '@/src/types'

export default async function InventoryPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager') {
    redirect('/?denied=managers-only')
  }

  // Fetch ingredients ordered by sort_order
  const { data: rawIngredients } = await supabase
    .from('ingredients')
    .select('id, name, unit, count_h, par_h')
    .order('sort_order', { ascending: true })

  // Fetch last 50 adjustments with ingredient name for history panel
  const { data: rawAdjustments } = await supabase
    .from('stock_adjustments')
    .select('id, ingredient_id, previous_h, new_h, delta_h, reason, cashier, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  // Convert hundredths → human units
  const ingredients: Ingredient[] = (rawIngredients ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    unit: row.unit,
    count: row.count_h / 100,
    par: row.par_h / 100,
  }))

  const adjustments: StockAdjustment[] = (rawAdjustments ?? []).map((row) => ({
    id: row.id,
    ingredientId: row.ingredient_id,
    previous: row.previous_h / 100,
    next: row.new_h / 100,
    delta: row.delta_h / 100,
    reason: row.reason ?? 'adjust',
    cashier: row.cashier,
    timestamp: row.created_at,
  }))

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col w-48 lg:w-56 shrink-0 p-4 gap-6"
        style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}
      >
        <div className="pt-2">
          <h1 className="font-bold text-xl" style={{ color: 'var(--foreground)' }}>
            Lina&apos;s POS
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {profile?.name ?? user.email} · {profile?.role}
          </p>
        </div>

        <nav className="flex-1 space-y-4">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--muted-foreground)' }}>
              Operate
            </p>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/dashboard"
                  className="flex items-center px-3 py-2 rounded-lg text-sm"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/users"
                  className="flex items-center px-3 py-2 rounded-lg text-sm"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Users &amp; roles
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--muted-foreground)' }}>
              Catalog
            </p>
            <ul className="space-y-1">
              <li>
                <span
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  Inventory
                </span>
              </li>
            </ul>
          </div>
        </nav>

        <ul className="space-y-1">
          <li>
            <Link
              href="/"
              className="flex items-center px-3 py-2 rounded-lg text-sm"
              style={{ color: 'var(--muted-foreground)' }}
            >
              ← Back to till
            </Link>
          </li>
        </ul>

        <LogoutButton />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <InventoryView ingredients={ingredients} adjustments={adjustments} />
      </main>
    </div>
  )
}
