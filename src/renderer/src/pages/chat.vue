<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue';
  import useChat from '@renderer/composables/useChat';
  import LayoutDefault from '@renderer/layout/LayoutDefault.vue';
  import Icon from '@renderer/components/common/Icon.vue';
  import LoadingSquareIcon from '@renderer/components/common/LoadingSquareIcon.vue';
  import { Button } from '@ui/button';
  import { Input } from '@ui/input';
  import { useChatStore } from '@renderer/stores/chat.store';
  import { useModelStore } from '@renderer/stores/model.store';
  import ChatMessage from '@renderer/components/chat/ChatMessage.vue';
  import ChatSystemPrompt from '@renderer/components/chat/ChatSystemPrompt.vue';
  import ChatExamples from '@renderer/components/chat/ChatExamples.vue';
  import ChatWelcome from '@renderer/components/chat/ChatWelcome.vue';
  import useScroll from '@renderer/composables/useScroll';
  import { useMutationObserver, useEventListener } from '@vueuse/core';
  import { useScroll as useVueUseScroll } from '@vueuse/core';
  import useDocuments from '@renderer/composables/useDocuments';
  import useToast from '@renderer/composables/useToast';
  import { Loader2Icon, Paperclip } from 'lucide-vue-next';
  import useHostFiles from '@renderer/composables/useHostFiles';
  import AttachedFile from '@renderer/components/attached/AttachedFile.vue';
  import { useGlobalEmbeddings } from '@renderer/composables/useGlobalEmbeddings';

  const {
    submitUserInput,
    onRunExample,
    onStopStreaming,
    initChat,
    newChatSession,
    registerStreamResponseListener,
    registerIsStreamingListener,
    removeIsStreamingListener,
    removeStreamResponseListener,
    assistantIsThinking,
    isStreaming,
    streamResponse,
    userInput
  } = useChat();

  const attachedDocument = ref(null);

  const chatMessagesContainerRef = ref<HTMLElement | null>(null);
  const autoScrollLocked = ref(false);

  const chat = useChatStore();
  const model = useModelStore();
  const toast = useToast();

  const { getFirstDocument } = useDocuments();
  const { embedFile, similaritySearch, embeddingIsLoading, searchIsLoading } =
    useGlobalEmbeddings();
  const { openFileDialog, fileDialogIsLoading } = useHostFiles();

  const submitLocked = computed(() => {
    return (
      !userInput.value ||
      userInput.value.trim() === '' ||
      isStreaming.value === true ||
      assistantIsThinking.value === true ||
      model.isModelLoadingInProgress === true ||
      model.isModelLoaded === false ||
      embeddingIsLoading.value === true ||
      fileDialogIsLoading.value === true
    );
  });

  const embeddingLocked = computed(() => {
    return (
      // model.isModelLoaded === false ||
      model.isModelLoadingInProgress === true ||
      isStreaming.value === true ||
      assistantIsThinking.value === true ||
      embeddingIsLoading.value === true ||
      fileDialogIsLoading.value === true
    );
  });

  const showExampleInputs = computed(() => {
    return chat.hasMessages === false && model.isModelLoaded === true;
  });

  const showWelcome = computed(() => {
    return chat.hasMessages === false && model.isModelLoaded === false;
  });

  const hasAttachedDocument = computed(() => attachedDocument.value !== null);

  const { arrivedState } = useVueUseScroll(chatMessagesContainerRef);
  const { scrollToBottom } = useScroll();

  useMutationObserver(
    chatMessagesContainerRef,
    (mutations) => {
      // Scroll to bottom when new messages are added
      // But only if the user is not scrolling up and the chat has arrived at the bottom
      if (!autoScrollLocked.value && mutations.length > 0)
        scrollToBottom(chatMessagesContainerRef.value, { behavior: 'smooth' });
    },
    {
      childList: true,
      subtree: true
    }
  );

  useEventListener(
    chatMessagesContainerRef,
    'wheel',
    () => {
      // Disable auto-scroll when the user scrolls up and re-enable it when back at the bottom
      if (arrivedState.bottom) {
        autoScrollLocked.value = false;
        return;
      }
      autoScrollLocked.value = true;
    },
    {
      passive: true
    }
  );

  async function onSubmitUserInput() {
    let res: string | undefined = undefined;
    if (submitLocked.value) return;
    if (userInput.value.trim() === '') return;
    if (hasAttachedDocument.value) {
      res = await similaritySearch({ query: userInput.value });
    }
    await submitUserInput({ context: res });
  }

  async function initAttachedDocument() {
    attachedDocument.value = await getFirstDocument();
  }

  async function onOpenAndEmbedFile() {
    if (!model.isModelLoaded) {
      toast.error({ message: 'Please load a model first' });
      return;
    }
    // TODO: this might be not needed
    if (fileDialogIsLoading.value || embeddingIsLoading.value || model.isModelLoadingInProgress)
      return;

    const path = await openFileDialog();
    if (!path) return;

    try {
      // embed the file
      await embedFile(path);
    } catch (error) {
      console.error(error);
      toast.error({ message: 'Failed to process file' });
      return;
    }

    await initAttachedDocument();
  }

  onMounted(async () => {
    // await initAttachedDocument();
    //
    await initChat();
    //
    if (chatMessagesContainerRef.value && chat.hasMessages === true) {
      scrollToBottom(chatMessagesContainerRef.value, { behavior: 'instant' });
    }
    registerStreamResponseListener();
    registerIsStreamingListener();
  });

  onUnmounted(async () => {
    await onStopStreaming();
    removeStreamResponseListener();
    removeIsStreamingListener();
  });
</script>

<template>
  <LayoutDefault class="h-full">
    <!-- Reset Chat -->
    <div v-if="chat.hasMessages" class="absolute right-10 top-5 z-10 flex p-4">
      <Button
        class="group shrink-0 cursor-pointer"
        variant="ghost"
        size="icon"
        @click="() => newChatSession()"
      >
        <Icon
          name="newChat"
          class="stroke-1.5 text-primary/30 group-hover:text-primary/100 size-5"
        />
      </Button>
    </div>
    <div v-if="hasAttachedDocument || embeddingIsLoading" class="absolute bottom-20 left-10 z-20">
      <AttachedFile :is-loading="embeddingIsLoading" @remove="() => (attachedDocument = null)" />
    </div>
    <!-- Chat Messages Container -->
    <div
      id="chatMessagesContainer"
      ref="chatMessagesContainerRef"
      class="no-scrollbar relative mt-5 h-full overflow-scroll rounded-lg border bg-white py-5 pl-10 pr-16"
    >
      <!-- Chat System Prompt -->
      <ChatSystemPrompt />

      <!-- Chat Messages List -->
      <div v-for="message in chat.getMessages" :key="message.id">
        <ChatMessage :id="message.id" :role="message.role" :content="message.content" />
      </div>
      <!-- Assistant Stream Response -->
      <ChatMessage v-if="streamResponse" :id="-1" role="assistant" :content="streamResponse" />
      <!-- Assistant Pending Indicator -->
      <ChatMessage v-if="assistantIsThinking" :id="-1" role="assistant" content="..." />
      <div id="bottom" ref="chatBottomRef"></div>
      <!-- Examples -->
      <ChatExamples
        v-if="showExampleInputs"
        class="absolute bottom-10 left-0 z-10 w-full"
        @run-example="(input: string) => onRunExample(input)"
      />
      <ChatWelcome v-if="showWelcome" />
    </div>
    <!-- Input -->
    <div class="flex h-20 shrink-0 items-center justify-center">
      <!-- File Dialog -->
      <Button
        :disabled="embeddingLocked"
        variant="outline"
        size="icon"
        class="mr-2"
        @click="() => onOpenAndEmbedFile()"
      >
        <Loader2Icon v-if="fileDialogIsLoading" class="stroke-1.5 size-4 animate-spin" />
        <Paperclip v-else class="stroke-1.5 size-4 -rotate-45" />
      </Button>

      <!-- User Input -->
      <form class="relative h-fit w-full" @submit.prevent="onSubmitUserInput">
        <Input ref="inputRef" v-model="userInput" type="text" placeholder="" class="!pr-10" />
        <button
          v-if="!isStreaming"
          type="submit"
          class="absolute right-2 top-1/2 cursor-pointer rounded-lg p-2 hover:bg-slate-100"
          style="transform: translateY(-50%)"
        >
          <Icon
            name="send"
            class="stroke-1.5 size-4"
            :class="{
              'text-primary/30': submitLocked,
              'text-primary': !submitLocked
            }"
          />
        </button>
        <button
          v-else
          class="absolute right-0 top-1/2 cursor-pointer rounded-lg p-2"
          style="transform: translateY(-50%)"
          @click="onStopStreaming"
        >
          <LoadingSquareIcon />
        </button>
      </form>
    </div>
  </LayoutDefault>
</template>
