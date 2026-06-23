import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import { UsersTable } from '@/src/components/users/UsersTable'

export async function UsersData() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: true })

  return <UsersTable profiles={profiles ?? []} currentUserId={user!.id} />
}
