import { useChatSettingsStore } from '@renderer/stores/chat-settings.store';
import { useChatStore } from '@renderer/stores/chat.store';
import { useModelStore } from '@renderer/stores/model.store';
import { ref, watch, computed } from 'vue';
import useToast from './useToast';
import useProgress from './useProgress';

export default function useChat() {
  const toast = useToast();
  const chat = useChatStore();
  const chatSettings = useChatSettingsStore();
  const modelStore = useModelStore();
  const streamResponse = ref('');
  const userInput = ref('');
  const requestIsPending = ref(false);
  const isStreaming = ref(false);

  const assistantIsThinking = computed(() => isStreaming.value && streamResponse.value === '');

  const { runFakeProgressBar } = useProgress();

  function setUserInput(value) {
    userInput.value = value;
  }

  function clearUserInput() {
    userInput.value = '';
  }

  function setResponse(value) {
    streamResponse.value = value;
  }

  function clearStreamResponse() {
    streamResponse.value = '';
  }

  function setRequestIsPending(value: boolean) {
    requestIsPending.value = value;
  }

  function setIsStreaming(value: boolean) {
    isStreaming.value = value;
  }

  async function getChatById(id: string) {
    const result = await window.electron.ipcRenderer.invoke('get-chat-by-id', id);
    return result;
  }

  async function getAllChats() {
    const result = await window.electron.ipcRenderer.invoke('get-all-chats');
    return result;
  }

  async function getAllChatsPaginated(page = 1, limit = 10) {
    const payload = { page, limit };
    const result = await window.electron.ipcRenderer.invoke('get-all-chats-paginated', payload);
    return result;
  }

  /**
   * Creates a new chat session if a model is loaded and no chat session exists.
   */
  async function initChat(): Promise<void> {
    if (!modelStore.isModelLoaded) return;
    if (!chat.getChatId) {
      await newChatSession();
    }
  }

  async function initChatMessages() {
    if (!chat.getChatId) return;
    try {
      const resChat = await window.electron.ipcRenderer.invoke('init-llm-history-from-chat', {
        chatId: chat.getChatId,
        systemPrompt: chatSettings.getSystemPrompt
      });
      if (!resChat) {
        throw new Error('Failed to initialize chat messages. Is the model loaded?');
      }
      if (!resChat.messages || resChat.messages.length < 1) {
        chat.clearMessages();
        return;
      }
      const messages = resChat.messages.map((message) => {
        return {
          id: message.id,
          role: message.role,
          content: message.content
        };
      });
      chat.setMessages(messages);
    } catch (error: any) {
      console.error(error);
      toast.error({ message: error?.message });
    }
  }

  async function onEjectModel() {
    if (!modelStore.isModelLoaded) return;
    await onStopStreaming();
    chat.clearMessages();
    modelStore.setModelIsUnloading();
    try {
      const { success } = await window.electron.ipcRenderer.invoke('unload-llm');
      if (!success) {
        throw new Error('Failed to unload model');
      }
      modelStore.setModelIsUnloaded();
    } catch (error: any) {
      modelStore.setModelIsLoaded();
      toast.error({ message: error?.message });
      console.error(error);
    }
  }

  async function onLoadModel(path: string | undefined) {
    if (!path) {
      return;
    }
    clearStreamResponse();
    modelStore.setModelIsLoading();
    runFakeProgressBar();
    try {
      const { success } = await window.electron.ipcRenderer.invoke('load-llm', path);
      if (!success) {
        throw new Error('Failed to load model');
      }
      const chatData = await window.electron.ipcRenderer.invoke('create-llm-session', {
        systemPrompt: chatSettings.getSystemPrompt
      });
      chat.setChatId(chatData?.id || '');
      chat.clearMessages();
      modelStore.setModelIsLoaded();
      toast.success({ message: 'Model loaded successfully' });
    } catch (error: any) {
      modelStore.setModelIsUnloaded();
      toast.error({ message: error?.message });
      console.error(error);
    }
  }

  async function onAbortLoadingModel() {
    try {
      await window.electron.ipcRenderer.invoke('abort-load-llm');
    } catch (error: any) {
      console.error(error);
    } finally {
      modelStore.setModelIsUnloaded();
    }
  }

  async function submitUserInput(payload: { context?: string }) {
    if (!modelStore.isModelLoaded || isStreaming.value === true) return;
    if (userInput.value.length < 1) return;
    if (!chat.getChatId) {
      console.error('Chat ID not found');
      return;
    }
    const prompt = userInput.value;
    chat.addMessage(prompt, 'user');

    clearUserInput();
    clearStreamResponse();
    setRequestIsPending(true);

    try {
      const response = await window.electron.ipcRenderer.invoke('chat-completion', {
        chatId: chat.getChatId,
        prompt,
        context: payload?.context,
        temperature: chatSettings.getTemperature,
        maxTokens: chatSettings.getMaxTokens
        // history: chat.getMessages // object cannot be cloned
      });

      if (!response || response.length < 1 || typeof response !== 'string') {
        throw new Error('Ups, something went wrong. Please create a new chat session.');
      }

      setRequestIsPending(false);
      setIsStreaming(false); // not really needed, because covered by isStreamingListener, but just in case
      clearStreamResponse();
      chat.addMessage(response, 'assistant');
    } catch (error: any) {
      setRequestIsPending(false);
      console.error(error);
      toast.error({ message: error?.message });
    }
  }

  async function onRunExample(prompt: string) {
    userInput.value = prompt;
    await submitUserInput({});
  }

  /**
   * Creates a new chat session.
   */
  async function newChatSession() {
    setRequestIsPending(true);
    try {
      const newChat = await window.electron.ipcRenderer.invoke('create-llm-session', {
        systemPrompt: chatSettings.getSystemPrompt
      });
      chat.setChatId(newChat?.id || '');
      chat.clearMessages();
    } catch (error) {
      console.error(error);
    }
    setRequestIsPending(false);
    clearStreamResponse();
  }

  function isStreamingListener(_, value: boolean) {
    setIsStreaming(value);
  }

  function streamResponseListener(_, data: string) {
    streamResponse.value += data;
  }

  let isStreamingListenerRef;
  function removeIsStreamingListener() {
    if (!isStreamingListenerRef) return;
    isStreamingListenerRef();
  }
  function registerIsStreamingListener() {
    isStreamingListenerRef = window.electron.ipcRenderer.on(
      'llm-is-streaming',
      isStreamingListener
    );
  }

  let streamResponseListenerRef;
  function removeStreamResponseListener() {
    if (!streamResponseListenerRef) return;
    streamResponseListenerRef();
  }
  function registerStreamResponseListener() {
    streamResponseListenerRef = window.electron.ipcRenderer.on(
      'new-llm-chunk',
      streamResponseListener
    );
  }

  async function onStopStreaming() {
    if (!modelStore.isModelLoaded) return;
    if (!isStreaming.value) return;
    await window.electron.ipcRenderer.invoke('stop-llm-streaming');
  }

  // Watch if system prompt changes
  watch(
    () => chatSettings.systemPromptHasChanged,
    async () => {
      if (modelStore.isModelLoaded) {
        await newChatSession();
      }
    }
  );

  return {
    requestIsPending,
    isStreaming,
    assistantIsThinking,
    streamResponse,
    userInput,
    getChatById,
    getAllChats,
    getAllChatsPaginated,
    initChat,
    initChatMessages,
    setUserInput,
    onRunExample,
    onLoadModel,
    onEjectModel,
    submitUserInput,
    onStopStreaming,
    newChatSession,
    onAbortLoadingModel,
    registerIsStreamingListener,
    registerStreamResponseListener,
    removeIsStreamingListener,
    removeStreamResponseListener
  };
}
