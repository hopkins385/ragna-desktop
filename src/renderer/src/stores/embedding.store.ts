import { defineStore } from 'pinia';

interface IEmbeddingStoreState {
  embeddingModelLoaded: boolean;
}

export const useEmbeddingStore = defineStore('embedding', {
  state: () =>
    ({
      embeddingModelLoaded: false
    }) as IEmbeddingStoreState,
  getters: {
    isEmbeddingModelLoaded(state) {
      return state.embeddingModelLoaded;
    }
  },
  actions: {
    setEmbeddingModelLoaded() {
      this.embeddingModelLoaded = true;
    }
  },
  persist: true
});
