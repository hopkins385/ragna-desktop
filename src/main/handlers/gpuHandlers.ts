import { ipcMain } from 'electron'
import { getAppStorage } from '../utils/store'

function getGPUAccelerationState() {
  const store = getAppStorage()
  const gpuLayers = store.get('gpu_layers', -1) as number
  return gpuLayers === -1 ? true : false
}

function setGPUAccelerationState(state: boolean) {
  const store = getAppStorage()
  store.set('gpu_layers', state === true ? -1 : 0)
}

export function handleGPUIPCs() {
  ipcMain.handle('get-gpu-acceleration-state', getGPUAccelerationState)
  ipcMain.handle('set-gpu-acceleration-state', (event, state) => setGPUAccelerationState(state))
}
