import { ref } from 'vue';

interface SimilaritySearchResult {
  content: string;
  distance: number;
}

export default function useEmbeddings() {
  const embeddingIsLoading = ref(false);
  const searchIsLoading = ref(false);

  async function embedFile(path: string) {
    embeddingIsLoading.value = true;

    const result = await window.electron.ipcRenderer.invoke('embed-file', path);
    embeddingIsLoading.value = false;

    return result;
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
