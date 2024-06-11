import { defineStore } from 'pinia'

interface IDownloadModel {
  id: string
  progress: number
  speed: number
}

interface IDownloadStoreState {
  pendingDownloads: IDownloadModel[]
  completedDownloads: IDownloadModel[]
}

export const useDownloadsStore = defineStore('downloads', {
  state: () =>
    ({
      pendingDownloads: [],
      completedDownloads: []
    }) as IDownloadStoreState,
  getters: {
    hasPendingDownloads(state) {
      return state.pendingDownloads.length > 0
    },
    getProgressById: (state) => (id: string) => {
      const download = state.pendingDownloads.find((d) => d.id === id)
      return download?.progress
    },
    getDlSpeedById: (state) => (id: string) => {
      const download = state.pendingDownloads.find((d) => d.id === id)
      return download?.speed
    },
    isDownloadPending: (state) => (id: string) => {
      return state.pendingDownloads.some((d) => d.id === id)
    },
    isDownloadCompleted: (state) => (id: string) => {
      return state.completedDownloads.some((d) => d.id === id)
    }
  },
  actions: {
    addPendingDownload(download: IDownloadModel) {
      this.pendingDownloads.push(download)
    },
    removePendingDownload(id: string) {
      const index = this.pendingDownloads.findIndex((d) => d.id === id)
      if (index !== -1) {
        this.pendingDownloads.splice(index, 1)
      }
    },
    updatePendingDownload(download: IDownloadModel) {
      const index = this.pendingDownloads.findIndex((d) => d.id === download.id)
      if (index !== -1) {
        this.pendingDownloads[index] = download
      }
    },
    updateDownloadProgress(id: string, progress: number, speed: number) {
      const index = this.pendingDownloads.findIndex((d) => d.id === id)
      if (index !== -1) {
        this.pendingDownloads[index].progress = progress
        this.pendingDownloads[index].speed = speed
      }
    },
    addCompletedDownload(download: IDownloadModel) {
      this.completedDownloads.push(download)
    },
    removeCompletedDownload(id: string) {
      const index = this.completedDownloads.findIndex((d) => d.id === id)
      if (index !== -1) {
        this.completedDownloads.splice(index, 1)
      }
    }
  },
  persist: true
})
