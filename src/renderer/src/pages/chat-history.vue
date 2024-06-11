<script setup lang="ts">
import { onMounted, ref } from 'vue';
import LayoutDefault from '@renderer/layout/LayoutDefault.vue';
import ChatHistory from '@/components/chat/ChatHistory.vue'
import { useChatStore } from '@renderer/stores/chat.store';
import { useRouter } from 'vue-router'
import useChat from '@renderer/composables/useChat';
import HeadingTitle from '@/components/heading/HeadingTitle.vue';
import useToast from '@renderer/composables/useToast';


const chats = ref('')

const chatStore = useChatStore()
const router = useRouter()
const toast = useToast()

const { initChatMessages } = useChat()

async function getAllChats() {
  const chats = await window.electron.ipcRenderer.invoke('get-all-chats')
  return chats
}

async function deleteChat(id: string) {
  await window.electron.ipcRenderer.invoke('delete-chat', id)
  if (chatStore.getChatId === id) {
    chatStore.setChatId('')
    chatStore.clearMessages()
  }
  chats.value = await getAllChats()
  toast.success({ message: 'Chat deleted' })
}

async function openChat(id: string) {
  chatStore.setChatId(id)
  await initChatMessages()
  router.push('/chat')
}

onMounted(async () => {
  chats.value = await getAllChats()
})

</script>

<template>
  <LayoutDefault>
    <HeadingTitle title="Chat History" />
    <div class="border rounded-xl p-5">
      <ChatHistory :chats="chats" @delete="async (id) => await deleteChat(id)"
        @open-chat="async (id) => await openChat(id)" />
    </div>
  </LayoutDefault>
</template>
