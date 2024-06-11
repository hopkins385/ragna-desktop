import { ipcMain, app } from 'electron'

function closeApp() {
  app.quit()
}

function getAppVersion() {
  return app.getVersion()
}

export function handleAppIPCs() {
  ipcMain.handle('close-application', closeApp)
  ipcMain.handle('get-app-version', getAppVersion)
}
