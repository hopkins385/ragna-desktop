<script setup lang="ts">
  import { ref } from 'vue';
  import LayoutDefault from '@renderer/layout/LayoutDefault.vue';
  import ChatHistory from '@/components/chat/ChatHistory.vue';
  import { useChatStore } from '@renderer/stores/chat.store';
  import { useRouter } from 'vue-router';
  import useChat from '@renderer/composables/useChat';
  import HeadingTitle from '@/components/heading/HeadingTitle.vue';
  import useToast from '@renderer/composables/useToast';
  import { computedAsync } from '@vueuse/core';
  import PaginateControls from '@/components/paginate/PaginateControls.vue';

  const chatStore = useChatStore();
  const router = useRouter();
  const toast = useToast();

  const { initChatMessages, getAllChatsPaginated } = useChat();

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

  async function openChat(id: string) {
    chatStore.setChatId(id);
    await initChatMessages();
    router.push('/chat');
  }

  const refreshTrigger = ref(0);
  const page = ref(1);
  const limit = ref(10);
  const chats = computedAsync(
    async () => {
      const trigger = refreshTrigger.value;
      return await getAllChatsPaginated(page.value, limit.value);
    },
    null // initial state
  );
</script>

<template>
  <LayoutDefault class="pb-10">
    <HeadingTitle title="Chat History" />
    <div class="rounded-xl border p-5">
      <ChatHistory
        :chats="chats?.data"
        @delete="async (id) => await deleteChat(id)"
        @open-chat="async (id) => await openChat(id)"
      />
    </div>
    <div class="pt-4">
      <PaginateControls
        v-model:page="page"
        :total="chats?.count"
        @update-page="async (value) => (page = value)"
      />
    </div>
  </LayoutDefault>
</template>
