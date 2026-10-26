import { execFile, spawn } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import type { AuthStatus } from '../shared/api-types'

const isWindows = process.platform === 'win32'
const exe = isWindows ? 'claude.exe' : 'claude'

/**
 * The environment the CLI runs with, minus what a host Claude Code session injects (when
 * Monteverdi is started from inside one). Without this, `auth status` reports the host's
 * borrowed auth instead of the CLI's own sign-in. `CLAUDE_CODE_OAUTH_TOKEN` is a user setting
 * (from `claude setup-token`), so it stays.
 */
function cliEnv(): NodeJS.ProcessEnv {
  return Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) =>
        key === 'CLAUDE_CODE_OAUTH_TOKEN' ||
        !(key === 'CLAUDECODE' || key.startsWith('CLAUDE_CODE_') || key.startsWith('CLAUDE_AGENT_SDK_')),
    ),
  )
}

const execFileAsync = promisify(execFile)
const run = (file: string, args: string[]) => execFileAsync(file, args, { env: cliEnv() })

/** Orders dotted versions newest first ("2.1.308" before "2.1.304"). */
function byVersionDesc(a: string, b: string) {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pb[i] ?? 0) - (pa[i] ?? 0)
    if (diff) return diff
  }
  return 0
}

/** The CLI the Claude desktop app bundles: %LOCALAPPDATA%\Claude-Data\<id>\claude-code\<version>\<hash>\claude.exe */
function desktopBundledCli(): string | null {
  const root = process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Claude-Data')
  if (!root || !existsSync(root)) return null
  for (const id of readdirSync(root)) {
    const codeDir = path.join(root, id, 'claude-code')
    if (!existsSync(codeDir)) continue
    for (const version of readdirSync(codeDir).sort(byVersionDesc)) {
      for (const hash of readdirSync(path.join(codeDir, version))) {
        const candidate = path.join(codeDir, version, hash, exe)
        if (existsSync(candidate)) return candidate
      }
    }
  }
  return null
}

async function onPath(): Promise<string | null> {
  try {
    const { stdout } = await run(isWindows ? 'where' : 'which', ['claude'])
    return stdout.split(/\r?\n/).find((line) => line.trim())?.trim() ?? null
  } catch {
    return null
  }
}

/**
 * Finds the Claude CLI: `MONTEVERDI_CLAUDE_BIN`, then PATH, then the native installer's
 * `~/.local/bin`, then the copy bundled with the Claude desktop app.
 */
export async function findClaudeCli(): Promise<string | null> {
  const fromEnv = process.env.MONTEVERDI_CLAUDE_BIN
  if (fromEnv && existsSync(fromEnv)) return fromEnv
  const local = path.join(homedir(), '.local', 'bin', exe)
  return (await onPath()) ?? (existsSync(local) ? local : null) ?? desktopBundledCli()
}

export async function cliVersion(bin: string): Promise<string | null> {
  try {
    const { stdout } = await run(bin, ['--version'])
    return stdout.trim().split(/\s/)[0] ?? null
  } catch {
    return null
  }
}

function pickStatus(status: AuthStatus): AuthStatus {
  return {
    loggedIn: status.loggedIn,
    authMethod: status.authMethod,
    email: status.email,
    orgName: status.orgName,
    subscriptionType: status.subscriptionType,
  }
}

export async function authStatus(bin: string): Promise<AuthStatus> {
  try {
    const { stdout } = await run(bin, ['auth', 'status', '--json'])
    return pickStatus(JSON.parse(stdout) as AuthStatus)
  } catch (error) {
    // `auth status` may exit non-zero when signed out but still print JSON
    const stdout = (error as { stdout?: string }).stdout
    try {
      if (stdout) return pickStatus(JSON.parse(stdout) as AuthStatus)
    } catch {
      // not JSON; treat as signed out
    }
    return { loggedIn: false }
  }
}

/**
 * Starts `claude auth login --claudeai` in its own console window, since the login flow is
 * interactive (it opens the browser and may ask for a pasted code). The page polls status.
 */
export function startLogin(bin: string) {
  if (isWindows) {
    spawn('cmd.exe', ['/c', 'start', '"Claude login"', `"${bin}"`, 'auth', 'login', '--claudeai'], {
      detached: true,
      stdio: 'ignore',
      env: cliEnv(),
      windowsVerbatimArguments: true,
    }).unref()
    return
  }
  spawn(bin, ['auth', 'login', '--claudeai'], { detached: true, stdio: 'ignore', env: cliEnv() }).unref()
}

export async function logout(bin: string) {
  await run(bin, ['auth', 'logout'])
}
