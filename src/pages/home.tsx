import { Card } from '@ui'
import { useStatus } from '../lib/status-context'

export function HomePage() {
  const { status } = useStatus()

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8">
      <Card className="p-6 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Monteverdi</h1>
        <p className="text-text-muted">An orchestration tool for Claude.</p>
        {status?.project && (
          <p className="text-sm">
            Working in <code className="px-1 rounded bg-hover-1">{status.project.dir}</code>
          </p>
        )}
      </Card>
    </div>
  )
}
