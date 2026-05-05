// src/pages/admin/AdminPanel.tsx  (stub — replaced in Task 5)
import type { Session } from '@supabase/supabase-js'
interface Props { session: Session }
export function AdminPanel({ session }: Props) {
  return <div className="p-8">Panel — {session.user.email}</div>
}
