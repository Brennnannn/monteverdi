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
  /** Everything Monteverdi needs is in place; otherwise the app sends you to /setup. */
  ready: boolean
}

export type FolderEntry = { name: string; path: string; hasEnv: boolean }

export type FolderListing = {
  /** `null` when listing drives (Windows only). */
  path: string | null
  /** `''` means "the drive list"; `null` means there's nothing above. */
  parent: string | null
  hasEnv: boolean
  folders: FolderEntry[]
}
