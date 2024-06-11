import { FileParserFactory } from '../factories/fileParserFactory'
import { ipcMain, dialog } from 'electron'

async function openFileDialog() {
  // supported file types: .txt, .pdf, .docx
  return dialog
    .showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Text Files', extensions: ['txt', 'pdf', 'docx'] }]
    })
    .then((result) => {
      if (result.canceled) {
        return null
      }
      return result.filePaths[0]
    })
    .catch((err) => {
      return err
    })
}

async function readFile(filePath: string) {
  const factory = new FileParserFactory(filePath)
  const data = await factory.loadData()
  return data
}

export function handleFileIPCs() {
  ipcMain.handle('open-file-dialog', openFileDialog)
  ipcMain.handle('read-file', async (_, path) => await readFile(path))
}
