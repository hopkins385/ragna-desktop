import { BrowserWindow, shell } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { fileURLToPath } from 'url';
import icon from '../../../resources/icon.png?asset';

let mainWindow: BrowserWindow | null = null;

export function getMainWindow(): BrowserWindow {
  if (!mainWindow) {
    return createWindow();
  }
  return mainWindow;
}

export function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 13, y: 13 },
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: fileURLToPath(new URL('../preload/index.mjs', import.meta.url)),
      sandbox: false,
      // devTools: !app.isPackaged,
      allowRunningInsecureContent: false,
      enableBlinkFeatures: ''
      /*
      experimentalFeatures: false,
      webSecurity: true,
      webviewTag: false,
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInWorker: true*/
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // and load the index.html of the app.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // listen for win: messages
  mainWindow.webContents.on('ipc-message', (event, channel) => {
    if (channel === 'win:minimize') {
      mainWindow?.minimize();
    }

    if (channel === 'win:close') {
      mainWindow?.close();
    }

    if (channel === 'win:toggle-fullscreen') {
      mainWindow?.setFullScreen(!mainWindow.isFullScreen());
    }

    if (channel === 'win:maximize') {
      mainWindow?.maximize();
    }

    if (channel === 'win:close') {
      mainWindow?.close();
    }
  });

  return mainWindow;
}
