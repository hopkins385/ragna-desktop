import { useEmbeddingStore } from '@renderer/stores/embedding.store';
import { ref } from 'vue';

interface SimilaritySearchResult {
  content: string;
  distance: number;
}

export default function useEmbeddings() {
  const embeddingStore = useEmbeddingStore();
  const embeddingIsLoading = ref(false);
  const searchIsLoading = ref(false);

  async function embedFile(path: string) {
    embeddingIsLoading.value = true;

    try {
      const result = await window.electron.ipcRenderer.invoke('embed-file', path);

      // TODO: this is a hack to set the embedding model as loaded but it should be done in the main process
      // set the embedding model as loaded after first embedding
      if (embeddingStore.isEmbeddingModelLoaded !== true) {
        embeddingStore.setEmbeddingModelLoaded();
      }

      return result;
    } catch (e) {
      console.error('Failed to embed file', e);
      throw e;
    } finally {
      embeddingIsLoading.value = false;
    }
  }

  async function similaritySearchRaw(payload: {
    query: string;
  }): Promise<SimilaritySearchResult[]> {
    searchIsLoading.value = true;
    const result: SimilaritySearchResult[] = await window.electron.ipcRenderer.invoke(
      'similarity-search',
      {
        query: payload.query
      }
    );
    searchIsLoading.value = false;
    return result;
  }

  async function similaritySearch(payload: { query: string }): Promise<string> {
    searchIsLoading.value = true;
    const result: SimilaritySearchResult[] = await window.electron.ipcRenderer.invoke(
      'similarity-search',
      {
        query: payload.query
      }
    );
    searchIsLoading.value = false;
    return result.map((r) => r.content).join('\n');
  }

  return {
    embeddingIsLoading,
    searchIsLoading,
    embedFile,
    similaritySearchRaw,
    similaritySearch
  };
}
