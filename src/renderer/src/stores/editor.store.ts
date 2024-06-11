import { defineStore } from 'pinia'

export interface IEditorStoreState {
  content: string
}

export const useEditorStore = defineStore('editor', {
  state: () =>
    ({
      content: ''
    }) as IEditorStoreState,
  getters: {
    getContent(state) {
      return state.content
    }
  },
  actions: {
    setContent(content: string) {
      this.content = content
    }
  }
})
