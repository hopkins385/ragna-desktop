<script setup lang="ts">
  import TitleBar from '@/components/title/TitleBar.vue';
  import { Toaster } from '@/components/ui/sonner';
  import LoadingIndicator from './components/common/LoadingIndicator.vue';
  import NavBar from './components/nav/NavBar.vue';
  import { onMounted } from 'vue';
  import { useModelStore } from './stores/model.store';
  import { useChatStore } from './stores/chat.store';

  const modelStore = useModelStore();
  const chatStore = useChatStore();

  onMounted(() => {
    // listen for app-close event
    window.electron.ipcRenderer.on('app-will-quit', () => {
      chatStore.clearMessages();
      modelStore.setModelIsUnloaded();
    });
  });
</script>

<template>
  <div class="flex flex-col">
    <Toaster rich-colors />
    <TitleBar />
    <div class="relative flex h-[calc(100vh-44px)]">
      <LoadingIndicator />
      <NavBar />
      <!-- Main Content Container -->
      <!-- Warning: Do not remove id="main", its being queried! -->
      <div id="main" class="no-scrollbar size-full overflow-hidden border-l border-t bg-white">
        <router-view />
      </div>
    </div>
  </div>
</template>
