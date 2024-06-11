import { defineStore } from 'pinia'

enum ModelState {
  INIT = 'INIT',
  UNLOADED = 'UNLOADED',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  UNLOADING = 'UNLOADING',
  ERROR = 'ERROR'
}

interface IModelStoreState {
  modelPath: string | undefined
  modelLoadingProgress: number
  modelState: ModelState
}

export const useModelStore = defineStore('model', {
  state: () =>
    ({
      modelPath: undefined,
      modelLoadingProgress: 0,
      modelState: ModelState.INIT
    }) as IModelStoreState,
  getters: {
    isModelLoaded(state) {
      return state.modelState === ModelState.LOADED
    },
    isModelLoadingInProgress(state) {
      return state.modelState === ModelState.LOADING
    },
    loadingProgress(state) {
      return state.modelLoadingProgress
    }
  },
  actions: {
    setModelPath(path: string) {
      this.modelPath = path
    },
    setModelIsLoaded() {
      this.modelState = ModelState.LOADED
    },
    setModelIsLoading() {
      this.modelState = ModelState.LOADING
    },
    setModelIsUnloading() {
      this.modelState = ModelState.UNLOADING
    },
    setModelIsUnloaded() {
      this.modelState = ModelState.UNLOADED
      this.modelPath = undefined
    },
    incrementLoadingProgress(value: number = 1) {
      this.modelLoadingProgress += value
    },
    setLoadingProgress(value: number) {
      this.modelLoadingProgress = value
    },
    resetLoadingProgress() {
      this.modelLoadingProgress = 0
    }
  },
  persist: true
})
