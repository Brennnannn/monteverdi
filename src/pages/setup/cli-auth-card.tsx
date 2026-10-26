import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, CircleAlert, LogIn, LogOut, Terminal } from 'lucide-react'
import { Button, Card } from '@ui'
import { api } from '../../lib/api'
import { useStatus } from '../../lib/status-context'

const POLL_MS = 2000
const POLL_LIMIT_MS = 5 * 60 * 1000

/**
 * Shows which Claude CLI Monteverdi found and whether it's signed in to a Claude subscription.
 * "Sign in" opens `claude auth login` in its own console window, then polls until it lands.
 */
export function CliAuthCard() {
  const { status, refresh, setStatus } = useStatus()
  const [waiting, setWaiting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const poll = useRef<number | null>(null)

  const stopPolling = () => {
    if (poll.current !== null) window.clearInterval(poll.current)
    poll.current = null
    setWaiting(false)
  }

  useEffect(() => stopPolling, [])

  const signIn = async () => {
    setError(null)
    try {
      await api.login()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      return
    }
    setWaiting(true)
    const startedAt = Date.now()
    poll.current = window.setInterval(async () => {
      const next = await refresh()
      if (next?.auth?.loggedIn || Date.now() - startedAt > POLL_LIMIT_MS) stopPolling()
    }, POLL_MS)
  }

  const signOut = async () => {
    setError(null)
    try {
      setStatus(await api.logout())
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const cli = status?.cli
  const auth = status?.auth

  return (
    <Card className="p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Terminal className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Claude CLI</h2>
      </div>

      {!status && <p className="text-text-muted text-sm">Checking…</p>}

      {status && !cli?.path && (
        <div className="flex gap-2 text-sm">
          <CircleAlert className="h-5 w-5 shrink-0 text-error" />
          <p>
            Couldn't find the <code>claude</code> CLI. Install Claude Code, or set{' '}
            <code>MONTEVERDI_CLAUDE_BIN</code> to its path and restart the dev server.
          </p>
        </div>
      )}

      {cli?.path && (
        <>
          <p className="text-xs text-text-muted break-all">
            {cli.version ? `v${cli.version} · ` : ''}
            {cli.path}
          </p>

          {auth?.loggedIn ? (
            <div className="flex gap-2 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
              <div>
                <p>
                  Signed in as <span className="font-medium">{auth.email}</span>
                </p>
                <p className="text-text-muted">
                  {auth.authMethod === 'claude.ai' ? 'Claude subscription' : auth.authMethod}
                  {auth.subscriptionType ? ` · ${auth.subscriptionType}` : ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 text-sm">
              <CircleAlert className="h-5 w-5 shrink-0 text-warning" />
              <p>Not signed in. Sign in with your Claude subscription to continue.</p>
            </div>
          )}

          {waiting && (
            <p className="text-sm text-text-muted">
              Finish signing in in the console window that opened. This updates on its own.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button scheme={auth?.loggedIn ? 'default' : 'primary'} onClick={signIn} disabled={waiting} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              {auth?.loggedIn ? 'Switch account' : 'Sign in'}
            </Button>
            {auth?.loggedIn && (
              <Button onClick={signOut} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            )}
          </div>
        </>
      )}

      {error && <p className="text-sm text-error">{error}</p>}
    </Card>
  )
}
