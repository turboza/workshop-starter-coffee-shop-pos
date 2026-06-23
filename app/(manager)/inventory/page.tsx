export const dynamic = 'force-dynamic'

import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import { InventoryView } from '@/src/components/inventory/InventoryView'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Ingredient, StockAdjustment } from '@/src/types'

export default async function InventoryPage() {
  const supabase = await createSupabaseServerClient()

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
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <header
        className="md:hidden sticky top-0 z-10 flex items-center gap-2 -mx-4 px-4 py-2 mb-1 border-b backdrop-blur"
        style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
      >
        <SidebarTrigger />
        <span className="font-bold" style={{ color: 'var(--foreground)' }}>Inventory</span>
      </header>
      <InventoryView ingredients={ingredients} adjustments={adjustments} />
    </main>
  )
}
