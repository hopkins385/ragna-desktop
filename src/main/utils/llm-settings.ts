import { getAppStorage } from './store';
import { platform } from '@electron-toolkit/utils';

const defaultContextSize = 2048;
const defaultUseMlock = false;

export function setLlmContextSize(contextSize: number): void {
  const store = getAppStorage();
  store.set('llm-context-size', contextSize);
}

export function getLlmContextSize(): number {
  const store = getAppStorage();
  const contextSize = store.get('llm-context-size', defaultContextSize) as number;
  return contextSize;
}

export function setLlmGpuLayers(gpuLayers: number): void {
  const store = getAppStorage();
  store.set('gpu_layers', gpuLayers);
}

export function getLlmGpuLayers(): number {
  const defaultGpuLayers = platform.isMacOS ? -1 : 0;

  const store = getAppStorage();
  const gpuLayers = store.get('gpu_layers', defaultGpuLayers) as number;
  return gpuLayers;
}

export function getLlmUseMlock(): boolean {
  const store = getAppStorage();
  const useMlock = store.get('use_mlock', defaultUseMlock) as boolean;
  return useMlock;
}

export function setLlmUseMlock(useMlock: boolean): void {
  const store = getAppStorage();
  store.set('use_mlock', Boolean(useMlock));
}
