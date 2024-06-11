import { ipcMain, autoUpdater } from 'electron';

function installUpdate() {
  autoUpdater.quitAndInstall();
}

export function handleUpdateIPCs() {
  ipcMain.handle('install-update', installUpdate);
}
