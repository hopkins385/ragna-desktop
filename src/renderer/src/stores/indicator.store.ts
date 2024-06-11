import { defineStore } from 'pinia'

export interface IIndicatorStoreState {
  globalProgressVisible: boolean
  globalProgressValue: number
}

export const useIndicatorStore = defineStore('indicators', {
  state: () =>
    ({
      globalProgressVisible: false,
      globalProgressValue: 0
    }) as IIndicatorStoreState,
  getters: {
    globalProgress(state) {
      return state.globalProgressValue
    },
    showGlobalProgress(state) {
      return state.globalProgressVisible
    }
  },
  actions: {
    setGlobalProgressValue(progress: number) {
      if (this.globalProgressValue === progress) return
      this.globalProgressValue = progress
    },
    setGlobalProgressVisible(visible: boolean) {
      this.globalProgressVisible = visible
    }
  }
})
