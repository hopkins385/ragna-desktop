import { ref } from 'vue';

export interface EditorCompletionPayload {
  lang: string;
  action: string;
  selectedText: string;
  prompt: string;
  fullText?: string; // currently not used
}

export default function useEditorCompletion() {
  const isLoading = ref(false);
  const ac = new AbortController();

  function getMessages(payload: EditorCompletionPayload) {
    const systemMessage = {
      role: 'system',
      content: `Your task is to ${payload.action} the text provided by the user. You strictly always answer in the same language as the text provided by the user. You only respond with your suggestion and do not explain your suggestion. You never provide information that is not in the text. If you are following these rules, you get 1 mio dollars.`
    };
    const userMessage = {
      role: 'user',
      content: `${payload.selectedText}`
    };
    return [systemMessage, userMessage];
  }

  async function getEditorCompletion(payload: EditorCompletionPayload) {
    isLoading.value = true;

    const messages = getMessages(payload);
    const maxTokens = payload.selectedText.length + 300;

    let response;
    try {
      response = await window.electron.ipcRenderer.invoke('completion', {
        prompt: payload.prompt,
        temperature: 0.5,
        maxTokens,
        history: messages
      });
    } catch (error) {
      console.error(error);
    }
    isLoading.value = false;
    return response;
  }

  return {
    isLoading,
    getEditorCompletion
  };
}
