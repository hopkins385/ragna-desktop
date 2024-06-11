import { ipcMain } from 'electron'
import { getAppLogFilePath } from '../utils/path'
import { existsSync, readFile } from 'fs'

function getAppLog() {
  const logPath = getAppLogFilePath()
  if (!existsSync(logPath)) {
    return 'file not found'
  }
  // read file content and return
  return new Promise((resolve, reject) => {
    readFile(logPath, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
}

export function handleLogsIPCs() {
  ipcMain.handle('get-app-log', getAppLog)
}
