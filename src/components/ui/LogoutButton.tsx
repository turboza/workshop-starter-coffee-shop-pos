'use client'

import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/src/lib/supabase-browser'

export function LogoutButton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className={className} style={style}>
      Sign out
    </button>
  )
}
