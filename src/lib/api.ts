import type { Status } from '../../shared/api-types'

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = (await res.json()) as T & { error?: string }
  if (!res.ok) throw new Error(data.error ?? `${method} ${url} failed (${res.status})`)
  return data
}

/** Client for the local API in `server/api.ts`. */
export const api = {
  status: () => request<Status>('GET', '/api/status'),
  login: () => request<{ started: boolean }>('POST', '/api/auth/login'),
  logout: () => request<Status>('POST', '/api/auth/logout'),
  setProject: (dir: string) => request<Status>('PUT', '/api/project', { dir }),
  /** Opens the OS folder dialog; the returned status is unchanged if it was cancelled. */
  pickProject: () => request<Status>('POST', '/api/project/pick'),
}
