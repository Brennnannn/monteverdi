import { useEffect, useState } from 'react'
import { ChevronDown, Folder, Loader2 } from 'lucide-react'
import { Button, Card } from '@ui'
import { api } from '../../lib/api'
import { useStatus } from '../../lib/status-context'
import { inputStyle, labelStyle, rowButtonStyle } from './field'

/**
 * The project folder Monteverdi works in (whose `.env` it uses). Type or paste a path, pick one
 * of the last few from the dropdown, or "Select Folder" for the Windows folder dialog.
 */
export function ProjectFolderField() {
  const { status, setStatus } = useStatus()
  const [draft, setDraft] = useState('')
  const [open, setOpen] = useState(false)
  const [picking, setPicking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const current = status?.project?.dir ?? ''
  useEffect(() => setDraft(current), [current])

  const run = async (call: () => Promise<typeof status>) => {
    setError(null)
    try {
      const next = await call()
      if (next) setStatus(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const choose = (dir: string) => {
    setOpen(false)
    const trimmed = dir.trim()
    if (!trimmed || trimmed === current) return setDraft(current)
    void run(() => api.setProject(trimmed))
  }

  const selectFolder = async () => {
    setPicking(true)
    await run(api.pickProject)
    setPicking(false)
  }

  const recent = status?.recentDirs ?? []
  const project = status?.project
  const hint = !project
    ? null
    : !project.exists
      ? 'This folder no longer exists.'
      : project.hasEnv
        ? '.env found'
        : 'No .env in this folder'

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="project-folder" className={labelStyle}>
        Project folder
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <input
            id="project-folder"
            value={draft}
            placeholder={status ? 'No folder selected' : 'Checking…'}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => !open && choose(draft)}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className={`${inputStyle} pr-10`}
          />
          <button
            type="button"
            title="Recent folders"
            disabled={recent.length === 0}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setOpen((v) => !v)}
            className="absolute right-1 top-1 h-8 w-8 flex items-center justify-center rounded-md text-text-muted hover:bg-hover-1 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <Card className="absolute z-50 left-0 right-0 top-full mt-1 py-1 bg-background border border-trim">
                {recent.map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => choose(dir)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-hover-1 ${dir === current ? 'font-medium' : ''}`}
                  >
                    <Folder className="h-4 w-4 shrink-0 text-text-muted" />
                    <span className="truncate">{dir}</span>
                  </button>
                ))}
              </Card>
            </>
          )}
        </div>
        <Button scheme={project?.exists ? 'default' : 'primary'} onClick={selectFolder} disabled={picking} className={rowButtonStyle}>
          {picking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Folder className="h-4 w-4" />}
          Select Folder
        </Button>
      </div>
      {error ? <p className="text-sm text-error">{error}</p> : hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  )
}
