import { existsSync, mkdir, readFileSync } from 'fs';
import { app, ipcMain } from 'electron';
import { getAppStorage } from '../utils/store';
import { getResourcePath } from '../utils/path';
import { logger } from '../utils/logger';
import { join } from 'path';

/**
 * Set models default path
 */
function setModelsFolderPath(_event: Electron.IpcMainInvokeEvent | null, path: string) {
  const store = getAppStorage();
  store.set('models-folder-path', path);
}

/**
 * Init Models Folder
 */
function initModelsFolder() {
  const homePath = app.getPath('home');
  const defaultLlmFolder = 'LLM-Models';
  const folderPath = join(homePath, defaultLlmFolder);
  if (!existsSync(folderPath)) {
    mkdir(folderPath, { recursive: true, mode: 0o755 }, (err) => {
      if (err) {
        logger.log('Error creating folder: %s', err);
        throw err;
      }
    });
  }
  setModelsFolderPath(null, folderPath);
  return folderPath;
}

/**
 * Get models folder path
 * is exported and used by others
 */
export function getModelsFolderPath() {
  const store = getAppStorage();
  const folderPath = store.get('models-folder-path');
  if (!folderPath) {
    return initModelsFolder();
  }
  return folderPath as string;
}

/**
 * Get model list
 * is exported and used by others
 */
export async function getModelList() {
  const jsonFile = join(getResourcePath(), 'data', 'llmList.json');
  // check if file exists
  if (!existsSync(jsonFile)) {
    logger.error('File does not exist at: %s', jsonFile);
    throw new Error(`File does not exist: ${jsonFile}`);
  }

  return readFileSync(jsonFile, 'utf8');
}

export function handleModelPathIPCs() {
  ipcMain.handle('set-models-folder-path', setModelsFolderPath);
  ipcMain.handle('get-models-folder-path', getModelsFolderPath);
  ipcMain.handle('get-model-list', getModelList);
}
