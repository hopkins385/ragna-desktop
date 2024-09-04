import * as sentry from '@sentry/electron';
import { app, BrowserWindow } from 'electron';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { createWindow } from './utils/window';
import { handleVectorIPCs } from './handlers/vectorHandlers';
import { handleAppIPCs } from './handlers/appHandlers';
import { handlePathIPCs } from './handlers/pathHandlers';
import { handleDownloadIPCs } from './handlers/downloadHandlers';
import { handleLogsIPCs } from './handlers/logsHandlers';
import { handleUpdateIPCs } from './handlers/updateHandlers';
import { handleFileIPCs } from './handlers/fileHandlers';
import { handleInferenceIPCs } from './handlers/inferenceHandlers';
import { handleDatabaseIPCs } from './handlers/databaseHandlers';
import { globalDatabaseConn } from './database/connection';
import { logger } from './utils/logger';
import { handleChatIPCs } from './handlers/chatHandlers';
import { handleDocumentIPCs } from './handlers/documentHandlers';
import { handleServerIPCs } from './handlers/serverHandlers';
import { initSentry } from './handlers/sentryHandlers';
import { handleModelPathIPCs } from './handlers/modelPathHandlers';
import { handleModelSettingsIPCs } from './handlers/modelSettingsHandlers';
import { createMenu } from './utils/menu';
import { handleTransformerIPCs } from './handlers/transformerHandlers';
import { handleAnalyticsIPCs } from './handlers/analyticsHandlers';
import { trackEvent } from './utils/analytics';

const isSingleInstance = app.requestSingleInstanceLock();

if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

/**
 * Before quit
 */
app.on('before-quit', async () => {
  // Close all windows
  BrowserWindow.getAllWindows().forEach((win) => {
    // send app is closing signal to renderer
    win.webContents.send('app-will-quit');
    // close the window
    win.close();
  });

  // unload the llm model
  // await unloadLlama()

  // Close the database connection
  const db = globalDatabaseConn;
  await db.destroy();

  // track close app event
  await trackShutdownEvent();
});

function setAppId() {
  const appId = 'com.ragna.desktop-app';
  electronApp.setAppUserModelId(appId);
}

function setAppName() {
  app.setName('RAGNA Nano');
}

function addDevToolsListener() {
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });
}

async function trackStartupEvent() {
  if (is.dev) return;
  try {
    await trackEvent('app_startup');
  } catch (e) {
    console.error('Failed to track startup event', e);
  }
}

async function trackShutdownEvent() {
  if (is.dev) return;
  try {
    await trackEvent('app_shutdown');
  } catch (e) {
    console.error('Failed to track shutdown event', e);
  }
}

function registerHandlers() {
  handlePathIPCs();
  handleModelPathIPCs();
  handleModelSettingsIPCs();
  handleDownloadIPCs();
  // handleMetricsIPCs()
  handleAppIPCs();
  handleLogsIPCs();
  handleUpdateIPCs();
  handleFileIPCs();
  handleVectorIPCs();
  handleInferenceIPCs();
  handleDatabaseIPCs();
  handleChatIPCs();
  handleDocumentIPCs();
  handleServerIPCs();
  handleTransformerIPCs();
  handleAnalyticsIPCs();
}

function logException(error: any) {
  if (!error) return;
  logger.error('[Exception] %s', error);
  if (is.dev) return;
  sentry.captureException(error);
}

initSentry();

app
  .whenReady()
  .then(setAppId)
  .then(setAppName)
  .then(addDevToolsListener)
  .then(registerHandlers)
  .then(createMenu)
  .then(createWindow)
  // .then(initUpdater)
  .then(trackStartupEvent)
  .then(() => {
    console.log('App is ready: arch is', process.arch);
  })
  .catch((e) => logException(e));

// Handle uncaught exceptions
process.on('uncaughtException', (e) => {
  logException(e);
  // app.exit(1);
});
