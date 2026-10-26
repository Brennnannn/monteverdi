import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { OuterNav } from './nav/outer-nav'
import { useStatus } from '../lib/status-context'

function SettingsButton() {
  return (
    <Link
      to="/setup"
      title="Settings"
      className="flex items-center justify-center h-10 w-10 rounded-md text-text hover:bg-hover-1 transition-colors"
    >
      <Settings className="h-5 w-5" />
    </Link>
  )
}

/**
 * The outermost layout every page renders inside: the nav bar, then the route. Until setup is
 * complete (Claude CLI signed in, project folder chosen) every route redirects to /setup.
 */
export function AppShell() {
  const { status } = useStatus()
  const { pathname } = useLocation()

  if (status && !status.ready && pathname !== '/setup') return <Navigate to="/setup" replace />

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background text-text">
      <OuterNav navItems={[]} right={<SettingsButton />} className="border-b border-trim" />
      <main className="flex-1 min-h-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
