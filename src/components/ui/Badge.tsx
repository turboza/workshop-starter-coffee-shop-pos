interface BadgeProps {
  variant: 'new' | 'void' | 'live'
  className?: string
}

export function Badge({ variant, className = '' }: BadgeProps) {
  if (variant === 'new') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide ${className}`}
        style={{ background: 'var(--warning-bg)', color: 'var(--warning-text)' }}
      >
        NEW
      </span>
    )
  }

  if (variant === 'void') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide ${className}`}
        style={{ background: 'var(--destructive-bg)', color: 'var(--destructive)' }}
      >
        VOID
      </span>
    )
  }

  // live
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold tracking-wide ${className}`}
      style={{ background: 'var(--destructive-bg)', color: 'var(--destructive)' }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      LIVE
    </span>
  )
}
