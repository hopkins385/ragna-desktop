import { ipcMain } from 'electron';
import { getLlmContextSize, setLlmContextSize } from '../utils/llm-settings';

export function handleModelSettingsIPCs() {
  ipcMain.handle('set-llm-context-size', (_, ctxSize) => setLlmContextSize(ctxSize));
  ipcMain.handle('get-llm-context-size', () => getLlmContextSize());
}
