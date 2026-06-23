interface StatCardProps {
  label: string
  value: string
  sub: string
  subPositive?: boolean
  sample?: boolean
}

export function StatCard({ label, value, sub, subPositive, sample }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--muted-foreground)' }}>
          {label}
        </p>
        {sample && (
          <span
            className="text-xs px-1.5 py-0.5 rounded font-medium"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
          >
            sample
          </span>
        )}
      </div>
      <p className="font-bold text-3xl md:text-4xl" style={{ color: 'var(--foreground)' }}>
        {value}
      </p>
      <p
        className="text-xs"
        style={{
          color:
            subPositive === true
              ? 'oklch(0.527 0.154 150)'
              : subPositive === false
              ? 'var(--destructive)'
              : 'var(--muted-foreground)',
        }}
      >
        {sub}
      </p>
    </div>
  )
}
