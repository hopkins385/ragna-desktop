import { ipcMain } from 'electron';
import { startServer, stopServer, getServerStatus } from '../server';

export function handleServerIPCs() {
  ipcMain.handle('start-server', async () => {
    startServer({ port: 3000 });
  });

  ipcMain.handle('stop-server', async () => {
    stopServer();
  });

  ipcMain.handle('get-server-status', async () => {
    return getServerStatus();
  });
}
