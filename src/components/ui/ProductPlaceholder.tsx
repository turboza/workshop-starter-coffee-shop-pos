const PALETTE = [
  { bg: '#DBEAFE', text: '#1D4ED8' }, // blue
  { bg: '#EDE9FE', text: '#6D28D9' }, // violet
  { bg: '#D1FAE5', text: '#065F46' }, // green
  { bg: '#FEF3C7', text: '#92400E' }, // amber
  { bg: '#FCE7F3', text: '#9D174D' }, // pink
  { bg: '#E0F2FE', text: '#0369A1' }, // sky
  { bg: '#F3E8FF', text: '#7E22CE' }, // purple
  { bg: '#CCFBF1', text: '#0F766E' }, // teal
]

function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

interface ProductPlaceholderProps {
  name: string
  className?: string
}

export function ProductPlaceholder({ name, className = '' }: ProductPlaceholderProps) {
  const color = PALETTE[hashCode(name) % PALETTE.length]
  const letter = name.charAt(0).toUpperCase()

  return (
    <div
      className={`flex items-center justify-center rounded-lg text-4xl font-bold select-none ${className}`}
      style={{ background: color.bg, color: color.text }}
    >
      {letter}
    </div>
  )
}
