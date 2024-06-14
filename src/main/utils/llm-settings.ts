import { getAppStorage } from './store';

export function setLlmContextSize(contextSize: number) {
  const store = getAppStorage();
  store.set('llm-context-size', contextSize);
}

export function getLlmContextSize(): number {
  const store = getAppStorage();
  const contextSize = store.get('llm-context-size', 2048) as number;
  return contextSize;
}

export function setGpuLayers(gpuLayers: number) {
  const store = getAppStorage();
  store.set('gpu_layers', gpuLayers);
}

export function getGpuLayers() {
  const store = getAppStorage();
  const gpuLayers = store.get('gpu_layers', -1) as number;
  return gpuLayers;
}
