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

  async function initChat() {
    if (!modelStore.isModelLoaded) return;
    if (!chat.getChatId) {
      await newChatSession();
    }
  }

  async function initChatMessages() {
    if (!chat.getChatId) return;
    try {
      const resChat = await window.electron.ipcRenderer.invoke(
        'init-llm-history-from-chat',
        chat.getChatId
      );
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
    } catch (error) {
      console.error(error);
      toast.error({ message: error?.message });
    }
  }

  async function onEjectModel() {
    if (!modelStore.isModelLoaded) return;
    await onStop();
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
      const chatData = await window.electron.ipcRenderer.invoke('create-llm-session', {
        systemPrompt: chatSettings.getSystemPrompt
      });
      if (!success) {
        throw new Error('Failed to load model');
      }
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

  async function onSubmitUserInput() {
    if (!modelStore.isModelLoaded || isStreaming.value === true) return;
    if (userInput.value.length < 1) return;
    if (!chat.getChatId) {
      //await newChatSession()
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
    } catch (error) {
      setRequestIsPending(false);
      console.error(error);
      toast.error({ message: error?.message });
    }
  }

  async function onRunExample(prompt: string) {
    userInput.value = prompt;
    await onSubmitUserInput();
  }

  /*async function onResetChat() {
    await onStop()
    chat.clearMessages()
    // await newChatSession()
    await window.electron.ipcRenderer.invoke('clear-llm-history', chat.getChatId)
  }*/

  async function onNewChat() {}

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
    await window.electron.ipcRenderer.invoke('stop-llm-streaming');
  }

  async function onStop() {
    if (!modelStore.isModelLoaded) return;
    if (!isStreaming.value) return;
    await onStopStreaming();
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
    initChat,
    initChatMessages,
    setUserInput,
    onRunExample,
    onLoadModel,
    onEjectModel,
    onSubmitUserInput,
    onStopStreaming,
    onStop,
    newChatSession,
    registerIsStreamingListener,
    registerStreamResponseListener,
    removeIsStreamingListener,
    removeStreamResponseListener
  };
}
