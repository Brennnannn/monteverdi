import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'

export type MonteverdiConfig = {
  /** The project folder Monteverdi works in; its `.env` is the one that's read. */
  projectDir?: string
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
