'use client'

import { useMemo, useState } from 'react'
import { Label, Pie, PieChart } from 'recharts'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { products } from '@/src/data/products'
import type { Category } from '@/src/types'

type Period = 'TODAY' | 'WEEK' | 'MONTH'

export type RawItem = { productName: string; quantity: number; createdAt: string }

// Map each product name to its category so we can group sold items.
const nameToCategory = new Map<string, Category>(products.map((p) => [p.name, p.category]))

const CATEGORIES: Category[] = ['Coffee', 'Tea', 'Pastry', 'Cold drinks', 'Specials']

// One chart colour per category (uses the design-system chart tokens).
// Note: slice fills are set directly on each datum (below) because Recharts/
// ChartContainer can't build a CSS var from a key containing a space.
const categoryColor: Record<Category, string> = {
  Coffee: 'var(--chart-2)',
  Tea: 'var(--chart-1)',
  Pastry: 'var(--chart-3)',
  'Cold drinks': 'var(--chart-4)',
  Specials: 'var(--chart-5)',
}

const chartConfig = {
  Coffee: { label: 'Coffee' },
  Tea: { label: 'Tea' },
  Pastry: { label: 'Pastry' },
  'Cold drinks': { label: 'Cold drinks' },
  Specials: { label: 'Specials' },
} satisfies ChartConfig

function inWindow(isoString: string, days: number): boolean {
  return new Date(isoString) >= new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

function isToday(isoString: string): boolean {
  const d = new Date(isoString)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export function SalesMix({ rawItems }: { rawItems: RawItem[] }) {
  const [period, setPeriod] = useState<Period>('TODAY')

  const data = useMemo(() => {
    const filter =
      period === 'TODAY' ? isToday :
      period === 'WEEK' ? (iso: string) => inWindow(iso, 7) :
                          (iso: string) => inWindow(iso, 30)

    const counts = new Map<Category, number>()
    for (const item of rawItems) {
      if (!filter(item.createdAt)) continue
      const category = nameToCategory.get(item.productName)
      if (!category) continue
      counts.set(category, (counts.get(category) ?? 0) + item.quantity)
    }
    return CATEGORIES.map((category) => ({
      category,
      items: counts.get(category) ?? 0,
      fill: categoryColor[category],
    })).filter((d) => d.items > 0)
  }, [rawItems, period])

  const total = data.reduce((sum, d) => sum + d.items, 0)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-bold text-xl">Sales mix</CardTitle>
        <CardDescription>Items sold by category</CardDescription>
        <CardAction>
          <ToggleGroup
            value={[period]}
            onValueChange={(vals) => { if (vals.length > 0) setPeriod(vals[vals.length - 1] as Period) }}
            variant="outline"
            size="sm"
            spacing={0}
          >
            <ToggleGroupItem value="TODAY">Today</ToggleGroupItem>
            <ToggleGroupItem value="WEEK">Week</ToggleGroupItem>
            <ToggleGroupItem value="MONTH">Month</ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1">
        {total === 0 ? (
          <p className="text-sm py-12 text-center text-muted-foreground">No orders yet</p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[220px]"
          >
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="category" />} />
              <Pie data={data} dataKey="items" nameKey="category" innerRadius={60} strokeWidth={4}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {total.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 22}
                            className="fill-muted-foreground text-xs"
                          >
                            items sold
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
