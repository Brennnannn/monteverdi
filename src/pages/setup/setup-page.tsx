import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useStatus } from '../../lib/status-context'
import { ClaudeAccountField } from './claude-account-field'
import { ProjectFolderField } from './project-folder-field'

/**
 * Settings and first-run setup. Reached from the settings button, or by redirect whenever
 * something Monteverdi needs (Claude sign-in, project folder) is missing.
 */
export function SetupPage() {
  const { status, error } = useStatus()

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

      {status?.ready && (
        <Link to="/" className="self-end flex items-center gap-2 text-primary font-medium hover:underline">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
