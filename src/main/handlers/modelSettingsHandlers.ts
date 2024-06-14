import { ipcMain } from 'electron';
import {
  getLlmContextSize,
  getLlmGpuLayers,
  getLlmUseMlock,
  setLlmContextSize,
  setLlmGpuLayers,
  setLlmUseMlock
} from '../utils/llm-settings';

export function handleModelSettingsIPCs() {
  ipcMain.handle('set-llm-context-size', (_, ctxSize) => setLlmContextSize(ctxSize));
  ipcMain.handle('get-llm-context-size', () => getLlmContextSize());
  ipcMain.handle('set-llm-gpu-layers', (_, gpuLayers) => setLlmGpuLayers(gpuLayers));
  ipcMain.handle('get-llm-gpu-layers', () => getLlmGpuLayers());
  ipcMain.handle('set-llm-use-mlock', (_, useMlock) => setLlmUseMlock(useMlock));
  ipcMain.handle('get-llm-use-mlock', () => getLlmUseMlock());
}
