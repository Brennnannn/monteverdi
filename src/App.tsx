import { Button, Card } from '@ui'

export function App() {
  return (
    <main className="min-h-full bg-background text-text flex items-center justify-center p-4">
      <Card className="p-6 max-w-md w-full flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Monteverdi</h1>
        <p className="text-text-muted">An orchestration tool for Claude.</p>
        <Button scheme="primary" onClick={() => console.log('hello')}>Get started</Button>
      </Card>
    </main>
  )
}
