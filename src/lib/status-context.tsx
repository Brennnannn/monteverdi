import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Status } from '../../shared/api-types'
import { api } from './api'

type StatusValue = {
  /** `null` until the first load finishes. */
  status: Status | null
  error: string | null
  refresh: () => Promise<Status | null>
  /** Use after an API call that already returned a fresh status. */
  setStatus: (status: Status) => void
}

const statusContext = createContext<StatusValue | null>(null)

/**
 * Loads Monteverdi's setup status (CLI, auth, project folder) once and shares it, so the
 * shell can gate on `ready` and /setup can refresh it after each change.
 */
export function StatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const next = await api.status()
      setStatus(next)
      setError(null)
      return next
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      return null
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return <statusContext.Provider value={{ status, error, refresh, setStatus }}>{children}</statusContext.Provider>
}

export function useStatus() {
  const value = useContext(statusContext)
  if (!value) throw new Error('useStatus requires a StatusProvider')
  return value
}
