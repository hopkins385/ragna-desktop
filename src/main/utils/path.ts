import { join } from 'path'
import { app } from 'electron'
import { mkdir } from 'fs-extra'
import { existsSync } from 'fs'
import { logger } from './logger'

export async function createDataFolder(): Promise<void> {
  const dataFolderPath = app.getPath('userData')
  if (!existsSync(dataFolderPath)) {
    try {
      await mkdir(dataFolderPath)
    } catch (err) {
      logger.error(`Unable to create data folder at ${dataFolderPath}: ${err}`)
    }
  }
}

export function getDataPath() {
  const dataPath = app.getPath('userData')

  if (!app.isPackaged) {
    return join(__dirname, '..', '..', 'data')
  }

  return dataPath
}

export function getAppLogFilePath(): string {
  return join(getDataPath(), 'logs', 'ragna-app.log')
}

export function getResourcePath() {
  let appPath = join(process.resourcesPath, 'app.asar.unpacked', 'resources')

  if (!app.isPackaged) {
    appPath = join(__dirname, '..', '..', 'resources')
  }
  return appPath
}

export function getVectorDbPath() {
  return join(getDataPath(), 'vdb', 'vector-db')
}

export function getSqliteDbPath() {
  return join(getDataPath(), 'db', 'database.sqlite')
}
