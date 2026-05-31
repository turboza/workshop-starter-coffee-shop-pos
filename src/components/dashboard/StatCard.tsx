interface StatCardProps {
  label: string
  value: string
  sub: string
  subPositive?: boolean
}

export function StatCard({ label, value, sub, subPositive }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: 'var(--card)', border: '1px solid var(--border-light)' }}
    >
      <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      <p className="font-display font-bold text-4xl" style={{ color: 'var(--text)' }}>
        {value}
      </p>
      <p
        className="text-xs"
        style={{
          color:
            subPositive === true
              ? 'var(--success)'
              : subPositive === false
              ? 'var(--destructive)'
              : 'var(--text-muted)',
        }}
      >
        {sub}
      </p>
    </div>
  )
}
