<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';
  import LayoutDefault from '@renderer/layout/LayoutDefault.vue';
  import HeadingTitle from '@/components/heading/HeadingTitle.vue';
  import { computedAsync, useMutationObserver } from '@vueuse/core';
  import useChat from '@renderer/composables/useChat';
  import ChatMessage from '@renderer/components/chat/ChatMessage.vue';
  import { SquareArrowOutUpRightIcon, Trash2Icon } from 'lucide-vue-next';
  import { useChatStore } from '@renderer/stores/chat.store';
  import { useRouter } from 'vue-router';
  import useToast from '@renderer/composables/useToast';

  const refreshTrigger = ref(0);
  const selectedChatId = ref('');
  const chatMessagesContainerRef = ref<HTMLElement | null>(null);

  const chatStore = useChatStore();
  const router = useRouter();
  const toast = useToast();

  const { getAllChats, getChatById, initChatMessages } = useChat();

  const chats = computedAsync(
    async () => {
      const trigger = refreshTrigger.value;
      const chats = await getAllChats();
      selectedChatId.value = chats?.[0]?.id;
      return chats;
    },
    null // initial state
  );

  const chat = computedAsync(
    async () => {
      return await getChatById(selectedChatId.value);
    },
    null // initial state
  );

  /*useMutationObserver(
    chatMessagesContainerRef,
    () => {
      if (chatMessagesContainerRef.value) {
        chatMessagesContainerRef.value.scrollTop = chatMessagesContainerRef.value.scrollHeight;
      }
    },
    {
      childList: true,
      subtree: true
    }
  );*/

  function dateForHumans(dateValue: string) {
    // data should look like this: 16.06.2024, 17:55
    // 'd.M.y, H:mm'
    const date = new Date(dateValue);
    return date.toLocaleDateString('de-DE', {
      weekday: 'short',
      year: '2-digit',
      month: '2-digit',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async function openChat(id: string) {
    chatStore.setChatId(id);
    await initChatMessages();
    router.push('/chat');
  }

  async function deleteChat(id: string) {
    await window.electron.ipcRenderer.invoke('delete-chat', id);
    if (chatStore.getChatId === id) {
      chatStore.setChatId('');
      chatStore.clearMessages();
    }
    // refresh chats
    refreshTrigger.value += 1;
    toast.success({ message: 'Chat deleted' });
  }
</script>

<template>
  <LayoutDefault>
    <HeadingTitle title="Chat History" />
    <div class="grid grid-cols-9">
      <div class="no-scrollbar col-span-2 h-[calc(100vh-200px)] overflow-y-scroll border-0">
        <div
          v-for="c in chats"
          :key="c.id"
          class="group/box flex cursor-pointer items-center justify-between border-0 p-2 hover:bg-gray-100"
          :class="{ 'bg-gray-100': selectedChatId === c.id }"
        >
          <div class="" @click="() => (selectedChatId = c.id)">
            <p class="font-semibold">{{ c.title }}</p>
            <p class="text-sm opacity-60">{{ dateForHumans(c.createdAt) }}</p>
          </div>
          <div class="flex">
            <div
              class="group/out z-10 hidden border-0 p-3 opacity-60 group-hover/box:block"
              @click.stop="() => openChat(c.id)"
            >
              <SquareArrowOutUpRightIcon
                class="stroke-1.5 size-4 group-hover/out:scale-105 group-hover/out:stroke-2"
              />
            </div>
            <div
              class="group/del z-10 hidden border-0 p-3 opacity-60 group-hover/box:block"
              @click.stop="() => deleteChat(c.id)"
            >
              <Trash2Icon
                class="stroke-1.5 group-hover/del:text-destructive size-4 group-hover/del:scale-105 group-hover/del:stroke-2"
              />
            </div>
          </div>
        </div>
      </div>
      <div
        id="chatMessagesContainer"
        ref="chatMessagesContainerRef"
        class="no-scrollbar col-span-7 h-[calc(100vh-300px)] overflow-y-scroll rounded-lg border pr-5"
      >
        <ChatMessage
          v-for="m in chat?.messages"
          :id="m?.id"
          :key="m?.id"
          :content="m?.content ?? ''"
          :role="m?.role"
        />
      </div>
    </div>
  </LayoutDefault>
</template>
