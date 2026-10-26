import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button, FormWrapper, useFormFull } from '@ui'
import { api } from '../../lib/api'
import { useStatus } from '../../lib/status-context'
import { ClaudeAccountField } from './claude-account-field'
import { ProjectFolderField } from './project-folder-field'
import type { SetupForm } from './setup-form'

/** Submits the form; clickable once both fields have a value. */
function ContinueButton({ saving }: { saving: boolean }) {
  const { form } = useFormFull<SetupForm>()
  return (
    <Button type="submit" scheme="primary" disabled={!form.account || !form.projectDir.trim() || saving} className="self-start gap-2">
      Continue
      <ArrowRight className="h-4 w-4" />
    </Button>
  )
}

/**
 * Settings and first-run setup. Reached from the settings button, or by redirect whenever
 * something Monteverdi needs (Claude sign-in, project folder) is missing.
 */
export function SetupPage() {
  const { status, error, setStatus } = useStatus()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Seeded once from the first status; ClaudeAccountField keeps `account` current after that
  const loaded = status !== null
  const initial = useMemo<SetupForm>(() => ({ account: '', projectDir: status?.project?.dir ?? '' }), [loaded])

  const save = async ({ projectDir }: SetupForm) => {
    setSaving(true)
    setSaveError(null)
    try {
      const next = await api.setProject(projectDir.trim())
      setStatus(next)
      if (next.ready) navigate('/')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Setup</h1>
        <p className="text-text-muted">
          {status && !status.ready
            ? 'Monteverdi needs these before it can run.'
            : 'Your Claude account and the project Monteverdi works in.'}
        </p>
      </div>

      {error && <p className="text-sm text-error">Couldn't reach the local API: {error}</p>}

      {loaded ? (
        <FormWrapper<SetupForm> initial={initial} onSubmit={save} className="flex flex-col gap-6">
          <ClaudeAccountField />
          <ProjectFolderField />
          <div className="flex flex-col gap-1">
            <ContinueButton saving={saving} />
            {saveError && <p className="text-sm text-error">{saveError}</p>}
          </div>
        </FormWrapper>
      ) : (
        <p className="text-text-muted">Checking…</p>
      )}
    </div>
  )
}
