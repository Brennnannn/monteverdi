import { useEffect, useRef, useState } from 'react'
import { Loader2, Terminal } from 'lucide-react'
import { Button, FormField, useFormFull } from '@ui'
import { api } from '../../lib/api'
import { useStatus } from '../../lib/status-context'
import type { SetupForm } from './setup-form'

const POLL_MS = 2000
const POLL_LIMIT_MS = 5 * 60 * 1000

/**
 * Read-only field showing the connected Claude account, with "Connect Claude" beside it.
 * Connecting opens `claude auth login` in its own console window, then polls until it lands.
 */
export function ClaudeAccountField() {
  const { status, refresh } = useStatus()
  const { setFormField } = useFormFull<SetupForm>()
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const poll = useRef<number | null>(null)

  const email = status?.auth?.loggedIn ? (status.auth.email ?? 'Connected') : ''
  useEffect(() => setFormField('account', email), [email])

  const stopPolling = () => {
    if (poll.current !== null) window.clearInterval(poll.current)
    poll.current = null
    setConnecting(false)
  }

  useEffect(() => stopPolling, [])

  const connect = async () => {
    setError(null)
    try {
      await api.login()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      return
    }
    setConnecting(true)
    const startedAt = Date.now()
    poll.current = window.setInterval(async () => {
      const next = await refresh()
      if (next?.auth?.loggedIn || Date.now() - startedAt > POLL_LIMIT_MS) stopPolling()
    }, POLL_MS)
  }

  const placeholder = !status?.cli.path
    ? 'Claude CLI not found'
    : connecting
      ? 'Finish signing in in the console window…'
      : 'Not connected'

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-end gap-2">
        <FormField<SetupForm> fieldName="account" label="Claude account" readOnly placeholder={placeholder} />
        <Button scheme={email ? 'default' : 'primary'} onClick={connect} disabled={!status?.cli.path || connecting} className="gap-2">
          {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Terminal className="h-4 w-4" />}
          {email ? 'Reconnect' : 'Connect Claude'}
        </Button>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  )
}
