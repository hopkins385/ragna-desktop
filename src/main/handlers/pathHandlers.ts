import { ipcMain, dialog } from 'electron';
import { getModelsFolderPath } from './modelPathHandlers';
import recursive from 'recursive-readdir';

/**
 * Folder Files
 * Reads the folder and its subfolders and returns the paths of all files
 */
const readDir = () => {
  const modelsPath = getModelsFolderPath();
  return new Promise((resolve, reject) => {
    try {
      recursive(modelsPath, ['.DS_Store'], (err, result) => {
        if (err) {
          reject(err);
        } else {
          // only keep files with .gguf extension and sort them by name
          result = result.filter((file) => file.endsWith('.gguf')).sort();
          resolve(result);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Open folder dialog
 */
const openFolderDialog = async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return result.filePaths[0];
};

export function handlePathIPCs() {
  ipcMain.handle('open-folder-dialog', openFolderDialog);
  ipcMain.handle('read-folder-files', readDir);
}
