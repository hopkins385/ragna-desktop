<script setup lang="ts">
  import TitleBar from '@/components/title/TitleBar.vue';
  import { Toaster } from '@/components/ui/sonner';
  import LoadingIndicator from './components/common/LoadingIndicator.vue';
  import NavBar from './components/nav/NavBar.vue';
  import { onMounted } from 'vue';
  import { useModelStore } from './stores/model.store';
  import { useChatStore } from './stores/chat.store';
  import ModelSelector from './components/model/ModelSelector.vue';
  import { useEmbeddingStore } from './stores/embedding.store';
  import EmbeddingAlert from './components/embedding/EmbeddingAlert.vue';
  import { useGlobalEmbeddings } from './composables/useGlobalEmbeddings';

  const modelStore = useModelStore();
  const chatStore = useChatStore();
  const embeddingStore = useEmbeddingStore();
  const { embeddingIsLoading } = useGlobalEmbeddings();

  onMounted(() => {
    // listen for app-close event
    window.electron.ipcRenderer.on('app-will-quit', () => {
      chatStore.clearMessages();
      modelStore.setModelIsUnloaded();
    });
  });
</script>

<template>
  <div class="relative flex flex-col overflow-hidden">
    <Toaster rich-colors />
    <TitleBar />
    <div class="flex h-16 justify-center border-b px-10">
      <ModelSelector />
    </div>
    <LoadingIndicator />
    <div class="relative flex h-[calc(100vh-108px)]">
      <EmbeddingAlert
        v-if="embeddingIsLoading"
        :first-time="!embeddingStore.isEmbeddingModelLoaded"
      />
      <NavBar />
      <!-- Main Content Container -->
      <!-- Warning: Do not remove id="main", its being queried! -->
      <div id="main" class="no-scrollbar size-full overflow-hidden border-l bg-white">
        <router-view />
      </div>
    </div>
  </div>
</template>
