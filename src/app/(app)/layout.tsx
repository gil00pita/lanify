import { AppShell } from '@/components/app/app-shell'
import { RequireAuth } from '@/components/app/require-auth'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAuth>
      <AppShell title="Design Workspace">{children}</AppShell>
    </RequireAuth>
  )
}
