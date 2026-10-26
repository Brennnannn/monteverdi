import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import type { Status } from '../shared/api-types'
import { authStatus, cliVersion, findClaudeCli, logout, startLogin } from './claude-cli'
import { hasEnvFile, isDirectory, readConfig, writeConfig } from './config'
import { listFolders } from './folders'

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

async function readJson<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') as T
}

async function status(): Promise<Status> {
  const bin = await findClaudeCli()
  const [version, auth] = bin ? await Promise.all([cliVersion(bin), authStatus(bin)]) : [null, null]
  const { projectDir } = readConfig()
  const project = projectDir
    ? { dir: projectDir, exists: isDirectory(projectDir), hasEnv: hasEnvFile(projectDir) }
    : null

  return {
    cli: { path: bin, version },
    auth,
    project,
    ready: Boolean(auth?.loggedIn && project?.exists),
  }
}

async function handle(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const route = `${req.method} ${url.pathname}`

  switch (route) {
    case 'GET /api/status':
      return send(res, 200, await status())

    case 'POST /api/auth/login': {
      const bin = await findClaudeCli()
      if (!bin) return send(res, 404, { error: 'Claude CLI not found' })
      startLogin(bin)
      return send(res, 202, { started: true })
    }

    case 'POST /api/auth/logout': {
      const bin = await findClaudeCli()
      if (!bin) return send(res, 404, { error: 'Claude CLI not found' })
      await logout(bin)
      return send(res, 200, await status())
    }

    case 'GET /api/folders':
      return send(res, 200, await listFolders(url.searchParams.get('path') ?? undefined))

    case 'PUT /api/project': {
      const { dir } = await readJson<{ dir?: string }>(req)
      if (!dir || !isDirectory(dir)) return send(res, 400, { error: 'Not a folder' })
      writeConfig({ ...readConfig(), projectDir: dir })
      return send(res, 200, await status())
    }

    default:
      return send(res, 404, { error: `No route for ${route}` })
  }
}

/**
 * Monteverdi's local API, mounted on the Vite dev/preview server under `/api`. The browser
 * can't run the Claude CLI or read the filesystem, so those live here.
 */
export function monteverdiApi(): Plugin {
  const middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url?.startsWith('/api/')) return next()
    handle(req, res).catch((error: unknown) =>
      send(res, 500, { error: error instanceof Error ? error.message : String(error) }),
    )
  }
  return {
    name: 'monteverdi-api',
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  }
}
