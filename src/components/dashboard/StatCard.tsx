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
      style={{ background: 'var(--card)', border: '1px solid var(--border-light)' }}
    >
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
        {sample && (
          <span
            className="text-xs px-1.5 py-0.5 rounded font-medium"
            style={{ background: 'var(--accent-light)', color: 'var(--accent-dark)' }}
          >
            sample
          </span>
        )}
      </div>
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
