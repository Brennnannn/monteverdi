/** Types shared by the local API (`server/`) and the app (`src/`). Keep this file free of Node or DOM imports. */

export type AuthStatus = {
  loggedIn: boolean
  authMethod?: string
  email?: string
  orgName?: string
  subscriptionType?: string
}

export type Status = {
  cli: { path: string | null; version: string | null }
  auth: AuthStatus | null
  project: { dir: string; exists: boolean; hasEnv: boolean } | null
  /** Recently chosen project folders that still exist, newest first. */
  recentDirs: string[]
  /** Everything Monteverdi needs is in place; otherwise the app sends you to /setup. */
  ready: boolean
}
