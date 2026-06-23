import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import { InventoryView } from '@/src/components/inventory/InventoryView'
import { Ingredient, StockAdjustment } from '@/src/types'

export async function InventoryData() {
  const supabase = await createSupabaseServerClient()

  const { data: rawIngredients } = await supabase
    .from('ingredients')
    .select('id, name, unit, count_h, par_h')
    .order('sort_order', { ascending: true })

  const { data: rawAdjustments } = await supabase
    .from('stock_adjustments')
    .select('id, ingredient_id, previous_h, new_h, delta_h, reason, cashier, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

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

  return <InventoryView ingredients={ingredients} adjustments={adjustments} />
}
