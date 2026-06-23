'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
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

type RawOrder = { total: number; createdAt: string }

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export function HourlyChart({ orders }: { orders: RawOrder[] }) {
  // Bucket by local hour using the browser's timezone
  const hourlyMap = new Map<number, number>()
  for (let h = 7; h <= 20; h++) hourlyMap.set(h, 0)
  for (const order of orders) {
    const hour = new Date(order.createdAt).getHours()
    if (hourlyMap.has(hour)) {
      hourlyMap.set(hour, (hourlyMap.get(hour) ?? 0) + order.total)
    }
  }
  const data = Array.from(hourlyMap, ([hour, revenue]) => ({
    hour,
    label: `${String(hour).padStart(2, '0')}:00`,
    revenue,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold text-xl">Hourly revenue</CardTitle>
        <CardDescription>Today, by the hour</CardDescription>
        <CardAction>
          <span className="text-xs text-muted-foreground">07:00–20:00</span>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-40 w-full">
          <BarChart data={data} accessibilityLayer margin={{ left: -16, right: 0, top: 4 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              tickFormatter={(h) => String(h)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              width={48}
              tickFormatter={(v) => `฿${v}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelKey="label"
                  formatter={(value, name, item) => (
                    <div className="flex flex-1 items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span
                          className="size-2.5 shrink-0 rounded-[2px]"
                          style={{ background: 'var(--color-revenue)' }}
                        />
                        {item?.payload?.label}
                      </span>
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        ฿{Number(value).toLocaleString()}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
