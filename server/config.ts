import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'

const RECENT_LIMIT = 5

export type MonteverdiConfig = {
  /** The project folder Monteverdi works in; its `.env` is the one that's read. */
  projectDir?: string
  /** Last few project folders chosen, newest first (includes `projectDir`). */
  recentDirs?: string[]
}

const configDir = path.join(homedir(), '.monteverdi')
const configFile = path.join(configDir, 'config.json')

export function readConfig(): MonteverdiConfig {
  try {
    return JSON.parse(readFileSync(configFile, 'utf8')) as MonteverdiConfig
  } catch {
    return {}
  }
}

export function writeConfig(config: MonteverdiConfig) {
  mkdirSync(configDir, { recursive: true })
  writeFileSync(configFile, JSON.stringify(config, null, 2) + '\n')
}

/** Points Monteverdi at `dir` and moves it to the front of the recent list. */
export function setProjectDir(dir: string) {
  const config = readConfig()
  const recentDirs = [dir, ...(config.recentDirs ?? []).filter((recent) => recent !== dir)].slice(0, RECENT_LIMIT)
  writeConfig({ ...config, projectDir: dir, recentDirs })
}

export function isDirectory(dir: string) {
  try {
    return statSync(dir).isDirectory()
  } catch {
    return false
  }
}

export function hasEnvFile(dir: string) {
  return existsSync(path.join(dir, '.env'))
}
