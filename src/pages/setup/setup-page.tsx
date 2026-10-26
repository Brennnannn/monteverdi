import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@ui'
import { useStatus } from '../../lib/status-context'
import { ClaudeAccountField } from './claude-account-field'
import { ProjectFolderField } from './project-folder-field'

/**
 * Settings and first-run setup. Reached from the settings button, or by redirect whenever
 * something Monteverdi needs (Claude sign-in, project folder) is missing.
 */
export function SetupPage() {
  const { status, error } = useStatus()
  const navigate = useNavigate()

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

      <ClaudeAccountField />
      <ProjectFolderField />

      <Button scheme="primary" disabled={!status?.ready} onClick={() => navigate('/')} className="self-start gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
        Continue
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
