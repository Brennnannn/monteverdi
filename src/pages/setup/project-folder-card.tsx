import { useEffect, useState } from 'react'
import { ArrowUp, CheckCircle2, CircleAlert, FileKey, Folder, FolderOpen } from 'lucide-react'
import { Button, Card } from '@ui'
import type { FolderListing } from '../../../shared/api-types'
import { api } from '../../lib/api'
import { useStatus } from '../../lib/status-context'

/**
 * Picks the project folder Monteverdi points at (whose `.env` it reads). The browser can't see
 * real paths, so this browses folders through the local API; folders holding a `.env` are marked.
 */
export function ProjectFolderCard() {
  const { status, setStatus } = useStatus()
  const [listing, setListing] = useState<FolderListing | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const browse = async (path?: string) => {
    setError(null)
    try {
      setListing(await api.folders(path))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  // Start where the current project is, once status has loaded
  const startDir = status ? (status.project?.exists ? status.project.dir : undefined) : null
  useEffect(() => {
    if (startDir !== null) void browse(startDir)
  }, [startDir])

  const choose = async () => {
    if (!listing?.path) return
    setSaving(true)
    setError(null)
    try {
      setStatus(await api.setProject(listing.path))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  const project = status?.project
  const isCurrent = Boolean(listing?.path && project?.dir === listing.path)

  return (
    <Card className="p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <FolderOpen className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Project folder</h2>
      </div>

      {project ? (
        <div className="flex gap-2 text-sm">
          {project.exists ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
          ) : (
            <CircleAlert className="h-5 w-5 shrink-0 text-error" />
          )}
          <div className="min-w-0">
            <p className="font-medium break-all">{project.dir}</p>
            <p className="text-text-muted">
              {!project.exists ? 'This folder no longer exists.' : project.hasEnv ? 'Has a .env' : 'No .env in this folder'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 text-sm">
          <CircleAlert className="h-5 w-5 shrink-0 text-warning" />
          <p>Choose the project folder whose .env Monteverdi should use.</p>
        </div>
      )}

      {listing && (
        <div className="flex flex-col border border-trim rounded-md overflow-hidden">
          <div className="flex items-center gap-2 px-2 py-2 border-b border-trim bg-background">
            <button
              type="button"
              title="Up a folder"
              disabled={listing.parent === null}
              onClick={() => listing.parent !== null && browse(listing.parent)}
              className="h-8 w-8 shrink-0 flex items-center justify-center rounded-md hover:bg-hover-1 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <span className="text-sm break-all flex-1">{listing.path ?? 'This PC'}</span>
            {listing.hasEnv && <EnvBadge />}
          </div>
          <ul className="max-h-72 overflow-y-auto divide-y divide-trim">
            {listing.folders.length === 0 && <li className="px-3 py-2 text-sm text-text-muted">No sub-folders</li>}
            {listing.folders.map((folder) => (
              <li key={folder.path}>
                <button
                  type="button"
                  onClick={() => browse(folder.path)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-hover-1"
                >
                  <Folder className="h-4 w-4 shrink-0 text-text-muted" />
                  <span className="flex-1 truncate">{folder.name}</span>
                  {folder.hasEnv && <EnvBadge />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button scheme="primary" onClick={choose} disabled={!listing?.path || isCurrent || saving}>
          {isCurrent ? 'Current project' : 'Use this folder'}
        </Button>
        {listing?.path && !listing.hasEnv && <span className="text-xs text-text-muted">No .env here</span>}
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
    </Card>
  )
}

function EnvBadge() {
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-success/15 text-success shrink-0">
      <FileKey className="h-3 w-3" />
      .env
    </span>
  )
}
