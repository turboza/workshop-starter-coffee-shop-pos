interface BadgeProps {
  variant: 'new' | 'void' | 'live'
  className?: string
}

export function Badge({ variant, className = '' }: BadgeProps) {
  if (variant === 'new') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide ${className}`}
        style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
      >
        NEW
      </span>
    )
  }

  if (variant === 'void') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide ${className}`}
        style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}
      >
        VOID
      </span>
    )
  }

  // live
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold tracking-wide ${className}`}
      style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      LIVE
    </span>
  )
}
