import { execFile } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import type { FolderEntry, FolderListing } from '../shared/api-types'
import { hasEnvFile } from './config'

const run = promisify(execFile)
const isWindows = process.platform === 'win32'

async function windowsDrives(): Promise<FolderEntry[]> {
  const { stdout } = await run('powershell.exe', [
    '-NoProfile',
    '-Command',
    '(Get-PSDrive -PSProvider FileSystem).Root',
  ])
  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((root) => ({ name: root, path: root, hasEnv: hasEnvFile(root) }))
}

/**
 * Lists the sub-folders of `dir` (default: home), skipping dot-folders and node_modules.
 * On Windows, `dir === ''` lists the drives.
 */
export async function listFolders(dir?: string): Promise<FolderListing> {
  if (dir === '' && isWindows)
    return { path: null, parent: null, hasEnv: false, folders: await windowsDrives() }

  const current = path.resolve(dir || homedir())
  const up = path.dirname(current)
  const parent = up !== current ? up : isWindows ? '' : null

  const folders = readdirSync(current, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules')
    .map((entry) => {
      const full = path.join(current, entry.name)
      return { name: entry.name, path: full, hasEnv: hasEnvFile(full) }
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))

  return { path: current, parent, hasEnv: hasEnvFile(current), folders }
}
