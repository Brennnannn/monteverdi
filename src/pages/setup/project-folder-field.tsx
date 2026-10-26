import { useState } from 'react'
import { Folder, Loader2 } from 'lucide-react'
import { Button, FormField, useFormFull } from '@ui'
import { api } from '../../lib/api'
import { useStatus } from '../../lib/status-context'
import type { SetupForm } from './setup-form'

/**
 * The project folder Monteverdi works in (whose `.env` it uses). Type or paste a path, pick one
 * of the last few from the field's dropdown, or "Select Folder" for the Windows folder dialog.
 * The choice is saved when the form is submitted.
 */
export function ProjectFolderField() {
  const { status } = useStatus()
  const { form, setFormField } = useFormFull<SetupForm>()
  const [picking, setPicking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectFolder = async () => {
    setPicking(true)
    setError(null)
    try {
      const { dir } = await api.pickFolder()
      if (dir) setFormField('projectDir', dir)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setPicking(false)
    }
  }

  const saved = status?.project
  const hint = saved && saved.dir === form.projectDir ? (saved.hasEnv ? '.env found' : 'No .env in this folder') : null

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-end gap-2">
        <FormField<SetupForm> fieldName="projectDir" label="Project folder" placeholder="No folder selected" list="recent-folders" />
        <Button scheme={form.projectDir ? 'default' : 'primary'} onClick={selectFolder} disabled={picking} className="gap-2">
          {picking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Folder className="h-4 w-4" />}
          Select Folder
        </Button>
      </div>
      <datalist id="recent-folders">
        {status?.recentDirs.map((dir) => <option key={dir} value={dir} />)}
      </datalist>
      {error ? <p className="text-sm text-error">{error}</p> : hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  )
}
