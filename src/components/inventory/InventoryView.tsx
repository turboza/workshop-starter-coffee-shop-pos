'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Check, X, Minus, Plus, History, ClipboardList } from 'lucide-react'
import { Ingredient, StockAdjustment } from '@/src/types'
import { getStockStatus } from '@/src/lib/stockStatus'
import { createSupabaseBrowserClient } from '@/src/lib/supabase-browser'
import { cn } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'

// ─── Types ──────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'low' | 'approaching'

// ─── On-hand vs par bar ──────────────────────────────────────────────────────

function StockBar({ count, par }: { count: number; par: number }) {
  const status = getStockStatus(count, par)
  const max = Math.max(count, par) * 1.1
  const countPct = Math.min((count / max) * 100, 100)
  const parPct = Math.min((par / max) * 100, 100)

  const fillColor =
    status === 'below' ? 'var(--destructive)' :
    status === 'approaching' ? 'var(--warning)' :
    'var(--muted-foreground)'

  const label = `${count} on hand · par ${par}`

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <div
              className="relative flex-1 h-2.5 min-w-[120px] rounded-full overflow-visible cursor-default"
              style={{ background: 'var(--muted)' }}
            />
          }
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all"
            style={{ width: `${countPct}%`, background: fillColor, opacity: status === 'ok' ? 0.45 : 1 }}
          />
          {/* par tick marker */}
          <div
            className="absolute top-[-2px] h-[calc(100%+4px)] w-[2px] rounded-full"
            style={{ left: `${parPct}%`, background: 'var(--foreground)', opacity: 0.35 }}
          />
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ count, par }: { count: number; par: number }) {
  const status = getStockStatus(count, par)

  if (status === 'below') {
    return (
      <Badge className="bg-destructive/10 text-destructive border-destructive/20 font-semibold uppercase tracking-wide">
        Below par
      </Badge>
    )
  }
  if (status === 'approaching') {
    return (
      <Badge
        className="font-semibold uppercase tracking-wide"
        style={{
          background: 'color-mix(in srgb, var(--warning) 12%, transparent)',
          color: 'var(--warning)',
          borderColor: 'color-mix(in srgb, var(--warning) 25%, transparent)',
        }}
      >
        Soon
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-muted-foreground font-medium uppercase tracking-wide">
      OK
    </Badge>
  )
}

// ─── Inline count stepper ─────────────────────────────────────────────────────

interface StepperProps {
  ingredient: Ingredient
  onCommit: (ingredientId: string, newCount: number) => Promise<void>
  onCancel: () => void
}

function CountStepper({ ingredient, onCommit, onCancel }: StepperProps) {
  const [value, setValue] = useState(ingredient.count)
  const [saving, setSaving] = useState(false)

  const step = ingredient.unit === 'kg' || ingredient.unit === 'L' ? 0.1 : 1

  async function handleCommit() {
    setSaving(true)
    await onCommit(ingredient.id, value)
    setSaving(false)
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => setValue((v) => Math.max(0, parseFloat((v - step).toFixed(2))))}
        disabled={saving}
        className="size-9 shrink-0"
      >
        <Minus />
      </Button>
      <Input
        type="number"
        min={0}
        step={step}
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleCommit(); if (e.key === 'Escape') onCancel() }}
        className="w-20 text-center font-semibold"
        autoFocus
        disabled={saving}
      />
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => setValue((v) => parseFloat((v + step).toFixed(2)))}
        disabled={saving}
        className="size-9 shrink-0"
      >
        <Plus />
      </Button>
      <Button
        size="icon-sm"
        onClick={handleCommit}
        disabled={saving}
        className="size-9 shrink-0"
      >
        <Check />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onCancel}
        disabled={saving}
        className="size-9 shrink-0"
      >
        <X />
      </Button>
    </div>
  )
}

// ─── History sheet ────────────────────────────────────────────────────────────

function HistorySheet({
  open,
  onOpenChange,
  adjustments,
  ingredients,
  filterIngredientId,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  adjustments: StockAdjustment[]
  ingredients: Ingredient[]
  filterIngredientId: string | null
}) {
  const nameMap = new Map(ingredients.map((i) => [i.id, i.name]))

  const filtered = filterIngredientId
    ? adjustments.filter((a) => a.ingredientId === filterIngredientId)
    : adjustments

  function fmtDelta(delta: number) {
    return delta >= 0 ? `+${delta}` : `${delta}`
  }

  function relativeTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return new Date(iso).toLocaleDateString()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 sm:max-w-80 flex flex-col gap-0 p-0">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle>
            {filterIngredientId ? nameMap.get(filterIngredientId) : 'All changes'}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {filtered.length === 0 && (
            <p className="text-sm text-center py-8 text-muted-foreground">No changes yet</p>
          )}
          {filtered.map((adj) => (
            <div
              key={adj.id}
              className="rounded-lg p-3 flex flex-col gap-1 bg-muted border border-border"
            >
              {!filterIngredientId && (
                <p className="text-xs font-semibold text-foreground">
                  {nameMap.get(adj.ingredientId) ?? adj.ingredientId}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  {adj.previous} → {adj.next}
                </span>
                <span
                  className="text-xs font-semibold px-1.5 py-0.5 rounded"
                  style={{
                    background: adj.delta >= 0
                      ? 'color-mix(in srgb, var(--success) 15%, transparent)'
                      : 'color-mix(in srgb, var(--destructive) 12%, transparent)',
                    color: adj.delta >= 0 ? 'var(--success)' : 'var(--destructive)',
                  }}
                >
                  {fmtDelta(adj.delta)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {adj.cashier} · {adj.reason}
                </span>
                <span className="text-xs text-muted-foreground">
                  {relativeTime(adj.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Stocktake dialog ─────────────────────────────────────────────────────────

interface StocktakeDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  ingredients: Ingredient[]
  onConfirm: (changes: { id: string; newCount: number }[]) => Promise<void>
}

function StocktakeDialog({ open, onOpenChange, ingredients, onConfirm }: StocktakeDialogProps) {
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(ingredients.map((i) => [i.id, i.count]))
  )
  const [phase, setPhase] = useState<'edit' | 'confirm' | 'saving'>('edit')

  const changes = ingredients.filter((i) => counts[i.id] !== i.count)

  async function handleSave() {
    setPhase('saving')
    await onConfirm(changes.map((i) => ({ id: i.id, newCount: counts[i.id] })))
    setPhase('edit')
  }

  function handleOpenChange(v: boolean) {
    if (!v) setPhase('edit')
    onOpenChange(v)
  }

  const step = (unit: string) => unit === 'kg' || unit === 'L' ? 0.1 : 1

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={phase !== 'saving'}
        className="w-full max-w-lg sm:max-w-lg p-0 overflow-hidden flex flex-col gap-0"
      >
        <DialogHeader className="px-5 pt-4 pb-3 border-b border-border">
          <DialogTitle>New stock count</DialogTitle>
          <DialogDescription>
            Enter the actual counts — only changed rows will be saved
          </DialogDescription>
        </DialogHeader>

        {phase === 'saving' ? (
          <div className="flex items-center justify-center p-10">
            <p className="text-sm text-muted-foreground">Saving…</p>
          </div>
        ) : phase === 'confirm' ? (
          <>
            <div className="p-5 flex flex-col gap-3 max-h-[55vh] overflow-y-auto">
              <p className="text-sm font-semibold text-foreground">
                {changes.length === 0
                  ? 'No changes to save.'
                  : `${changes.length} ingredient${changes.length !== 1 ? 's' : ''} will be updated:`}
              </p>
              {changes.map((ing) => (
                <div key={ing.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{ing.name}</span>
                  <span className="text-muted-foreground">
                    {ing.count} → <strong className="text-foreground">{counts[ing.id]}</strong> {ing.unit}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border bg-muted/50 rounded-b-xl">
              <Button variant="outline" onClick={() => setPhase('edit')}>Back</Button>
              <Button onClick={handleSave} disabled={changes.length === 0}>
                Save {changes.length} change{changes.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="max-h-[55vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingredients.map((ing) => (
                    <TableRow key={ing.id}>
                      <TableCell className="font-medium">{ing.name}</TableCell>
                      <TableCell className="text-muted-foreground">{ing.unit}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={0}
                          step={step(ing.unit)}
                          value={counts[ing.id]}
                          onChange={(e) =>
                            setCounts((prev) => ({ ...prev, [ing.id]: parseFloat(e.target.value) || 0 }))
                          }
                          className={cn(
                            'w-24 text-right font-semibold ml-auto',
                            counts[ing.id] !== ing.count && 'border-primary'
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border bg-muted/50 rounded-b-xl">
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <Button onClick={() => setPhase('confirm')}>Review changes</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Live clock ───────────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    function tick() {
      const now = new Date()
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])

  return <>{time}</>
}

// ─── Main InventoryView ───────────────────────────────────────────────────────

interface InventoryViewProps {
  ingredients: Ingredient[]
  adjustments: StockAdjustment[]
}

export function InventoryView({ ingredients: initialIngredients, adjustments: initialAdjustments }: InventoryViewProps) {
  const router = useRouter()
  const [ingredients, setIngredients] = useState(initialIngredients)
  const [adjustments] = useState(initialAdjustments)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyIngredientId, setHistoryIngredientId] = useState<string | null>(null)
  const [stocktakeOpen, setStocktakeOpen] = useState(false)

  const belowCount = ingredients.filter((i) => getStockStatus(i.count, i.par) === 'below').length
  const approachingCount = ingredients.filter((i) => getStockStatus(i.count, i.par) === 'approaching').length
  const okCount = ingredients.filter((i) => getStockStatus(i.count, i.par) === 'ok').length

  // Sort: below → approaching → ok, stable within each group
  const sorted = [...ingredients].sort((a, b) => {
    const order = { below: 0, approaching: 1, ok: 2 }
    return order[getStockStatus(a.count, a.par)] - order[getStockStatus(b.count, b.par)]
  })

  const filtered = sorted.filter((ing) => {
    const status = getStockStatus(ing.count, ing.par)
    if (filter === 'low' && status !== 'below') return false
    if (filter === 'approaching' && status !== 'approaching') return false
    if (search && !ing.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const lastStocktake = adjustments.filter((a) => a.reason === 'stocktake').sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0]

  function fmtLastStocktake() {
    if (!lastStocktake) return '—'
    const d = new Date(lastStocktake.timestamp)
    return `${d.toLocaleDateString([], { day: '2-digit', month: 'short' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · by ${lastStocktake.cashier}`
  }

  async function handleAdjust(ingredientId: string, newCount: number) {
    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    const cashier = user?.user_metadata?.name ?? user?.email ?? 'unknown'

    const ing = ingredients.find((i) => i.id === ingredientId)!
    const previousH = Math.round(ing.count * 100)
    const newH = Math.round(newCount * 100)
    const deltaH = newH - previousH

    await supabase.from('ingredients').update({ count_h: newH }).eq('id', ingredientId)
    await supabase.from('stock_adjustments').insert({
      ingredient_id: ingredientId,
      previous_h: previousH,
      new_h: newH,
      delta_h: deltaH,
      reason: 'adjust',
      cashier,
    })

    setIngredients((prev) =>
      prev.map((i) => i.id === ingredientId ? { ...i, count: newCount } : i)
    )
    setEditingId(null)
    router.refresh()
  }

  async function handleStocktake(changes: { id: string; newCount: number }[]) {
    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    const cashier = user?.user_metadata?.name ?? user?.email ?? 'unknown'

    for (const { id, newCount } of changes) {
      const ing = ingredients.find((i) => i.id === id)!
      const previousH = Math.round(ing.count * 100)
      const newH = Math.round(newCount * 100)
      const deltaH = newH - previousH
      await supabase.from('ingredients').update({ count_h: newH }).eq('id', id)
      await supabase.from('stock_adjustments').insert({
        ingredient_id: id,
        previous_h: previousH,
        new_h: newH,
        delta_h: deltaH,
        reason: 'stocktake',
        cashier,
      })
    }

    setStocktakeOpen(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Stock · today <LiveClock />
          </h1>
          <p className="text-sm mt-0.5 text-muted-foreground">
            {ingredients.length} ingredients tracked · {okCount} healthy
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status summary — quiet */}
          <div className="flex items-center gap-2">
            {belowCount > 0 && (
              <Badge className="bg-destructive/10 text-destructive border-destructive/20 font-semibold">
                {belowCount} below par
              </Badge>
            )}
            {approachingCount > 0 && (
              <Badge
                variant="outline"
                className="text-muted-foreground"
              >
                {approachingCount} approaching
              </Badge>
            )}
          </div>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setHistoryIngredientId(null); setHistoryOpen(true) }}
            >
              <History data-icon="inline-start" />
              History
            </Button>
            <Button
              size="sm"
              onClick={() => setStocktakeOpen(true)}
            >
              <ClipboardList data-icon="inline-start" />
              New stock count
            </Button>
          </div>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-3 flex-wrap">
        <ToggleGroup
          value={[filter]}
          onValueChange={(v) => { if (v.length > 0) setFilter(v[v.length - 1] as FilterTab) }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="low">Low stock · {belowCount}</ToggleGroupItem>
          <ToggleGroupItem value="approaching">Approaching · {approachingCount}</ToggleGroupItem>
        </ToggleGroup>

        <div className="flex-1" />

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search ingredient…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 w-44 h-8 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden [--card-spacing:0]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="min-w-[160px]">On-hand vs par</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Par</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((ing) => {
                const status = getStockStatus(ing.count, ing.par)

                return (
                  <TableRow
                    key={ing.id}
                    className={cn(
                      status === 'below' && 'border-l-2 border-l-destructive/60'
                    )}
                  >
                    <TableCell
                      className="font-medium cursor-pointer hover:underline min-w-[160px]"
                      style={{ color: 'var(--foreground)' }}
                      onClick={() => {
                        setHistoryIngredientId(ing.id)
                        setHistoryOpen(true)
                      }}
                    >
                      {ing.name}
                    </TableCell>

                    <TableCell className="text-muted-foreground">{ing.unit}</TableCell>

                    <TableCell className="min-w-[160px]">
                      <StockBar count={ing.count} par={ing.par} />
                    </TableCell>

                    <TableCell className="text-right min-w-[160px]">
                      {editingId === ing.id ? (
                        <CountStepper
                          ingredient={ing}
                          onCommit={handleAdjust}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : (
                        <button
                          onClick={() => setEditingId(ing.id)}
                          className="font-semibold rounded px-2 py-1 min-h-[36px] min-w-[36px] hover:ring-1 hover:ring-border transition-all text-foreground bg-background"
                        >
                          {ing.count}
                        </button>
                      )}
                    </TableCell>

                    <TableCell className="text-right text-muted-foreground">{ing.par}</TableCell>

                    <TableCell>
                      <StatusBadge count={ing.count} par={ing.par} />
                    </TableCell>
                  </TableRow>
                )
              })}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No ingredients match
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs font-display italic text-muted-foreground">
          Tap any count to adjust — every change is logged with who &amp; when.
        </p>
        <p className="text-xs text-muted-foreground">
          Last full stocktake: {fmtLastStocktake()}
        </p>
      </div>

      {/* History sheet */}
      <HistorySheet
        open={historyOpen}
        onOpenChange={(v) => { setHistoryOpen(v); if (!v) setHistoryIngredientId(null) }}
        adjustments={adjustments}
        ingredients={ingredients}
        filterIngredientId={historyIngredientId}
      />

      {/* Stocktake dialog */}
      <StocktakeDialog
        open={stocktakeOpen}
        onOpenChange={setStocktakeOpen}
        ingredients={ingredients}
        onConfirm={handleStocktake}
      />
    </div>
  )
}
