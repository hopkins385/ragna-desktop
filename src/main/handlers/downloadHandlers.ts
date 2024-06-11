import { ipcMain } from 'electron'
import { getModelsFolderPath, getModelList } from '../handlers/modelHandlers'
import { getMainWindow } from '../utils/window'

import EasyDl from 'easydl'
import { clean } from 'easydl/dist/utils.js'

interface DownloadHfModelPayload {
  id: string
  url: string
  destination: string
}

interface dlItem {
  id: string
  destinationPath: string
  dlInstance: EasyDl
}

const donwloadList: dlItem[] = []

async function getModelHfDownloadUrl(id: string): Promise<{ url: string; fileName: string }> {
  const models = await getModelList()
  const list = JSON.parse(models)
  const model = list.find((m: any) => m.id === id)
  if (!model) return Promise.reject('Model not found')
  const { hf_params } = model
  // Example:
  // https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q8_0.gguf?download=true
  return {
    url: `${hf_params.owner}/${hf_params.repo}/resolve/main/${hf_params.file}`,
    fileName: hf_params.file
  }
}

function kbToMb(kb: number | undefined) {
  if (!kb) return 0
  // only 2 decimal places
  kb = Math.round((kb + Number.EPSILON) * 100) / 100
  return kb / 1024 / 1024
}

function createDownloadHfModel(payload: DownloadHfModelPayload) {
  const url = `https://huggingface.co/${payload.url}`

  const dl = new EasyDl(url, payload.destination, {
    connections: 1,
    maxRetry: 3,
    reportInterval: 3000,
    chunkSize: (size) => {
      return Math.min(size / 100, 100 * 1024 * 1024)
    }
  })
    .on('progress', ({ details, total }) => {
      const mainWindow = getMainWindow()
      mainWindow.webContents.send('download-progress', {
        id: payload.id,
        progress: total.percentage.toFixed(0),
        speed: kbToMb(total.speed).toFixed(2)
      })
    })
    .on('end', () => {
      const mainWindow = getMainWindow()
      mainWindow.webContents.send('download-completed', { id })
    })
    .on('close', () => {
      /*console.log('this close event will be fired after when instance is stopped (destroyed)')
      console.log(
        'If the download is complete (not cancelled), the .on(end) event will be fired before this event.'
      )
      console.log('otherwise, only this event will be fired.')*/
    })
    .on('error', (err) => {
      console.log('[error]', err)
      // handle some error here
    })

  return dl
}

/**
 * Download Model
 */
async function downloadHugModel(id: string) {
  const modelFolderPath = getModelsFolderPath()

  const { url: urlRoute, fileName } = await getModelHfDownloadUrl(id)

  const destination = modelFolderPath + '/' + fileName

  const dl = createDownloadHfModel({
    id,
    url: urlRoute,
    destination
  })

  const dlItem = {
    id,
    destinationPath: destination,
    dlInstance: dl
  }

  donwloadList.push(dlItem)

  dl.start()
}

async function abortDownload(id: string) {
  const dlItem = donwloadList.find((item) => item.id === id)
  if (!dlItem) throw new Error('Cannot find download to abort')
  dlItem.dlInstance.destroy()
  await clean(dlItem.destinationPath)
  donwloadList.splice(donwloadList.indexOf(dlItem), 1)
  return
}

export function handleDownloadIPCs() {
  ipcMain.handle('download-hf-model', async (_, id) => await downloadHugModel(id))
  ipcMain.handle('abort-download-hf-model', (_, id) => abortDownload(id))
}
