<script setup lang="ts">
  import image2 from '@/assets/images/bg_purple_wave.jpg';
  import image from '@/assets/images/bot.jpeg';
  import LlmModelCard from '@/components/llm/LLMModelCard.vue';
  import LayoutDefault from '@/layout/LayoutDefault.vue';
  import { useDownloadsStore } from '@/stores/download.store';
  import useFetchModel from '@renderer/composables/useFetchModel';
  import { useFuse } from '@vueuse/integrations/useFuse';
  import { onMounted, onUnmounted, ref } from 'vue';

  interface IModel {
    id: string;
    title: string;
    details: string;
    hf_params: {
      file_size: number;
    };
  }

  const search = ref('');
  const downloads = useDownloadsStore();
  const models = ref<IModel[]>([]);
  const { getModelList } = useFetchModel();

  const backgroundImage = {
    backgroundImage: `url(${image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  const backgroundImage2 = {
    backgroundImage: ` url(${image2})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  const { results } = useFuse(search, models, {
    fuseOptions: {
      keys: ['title']
    },
    matchAllWhenSearchEmpty: true
  });

  async function onDownloadModel(id: string) {
    // Check if model is already downloading
    if (downloads.pendingDownloads.find((d) => d.id === id)) return;
    // Start download
    try {
      downloads.addPendingDownload({
        id,
        progress: 0,
        speed: 1
      });
      await window.electron.ipcRenderer.invoke('download-hf-model', id);
    } catch (error) {
      console.error('Error downloading model', error);
    }
  }

  async function onAbortDownload(modelId: string) {
    const id = downloads.pendingDownloads.find((d) => d.id === modelId)?.id;
    if (!id) return;
    try {
      await window.electron.ipcRenderer.invoke('abort-download-hf-model', id);
    } catch (error) {
      console.error('Error aborting download', error);
    }
    downloads.removePendingDownload(modelId);
  }

  // Listen for download progress
  function onDownloadProgress(payload: any) {
    const { id, progress, speed } = payload;
    downloads.updateDownloadProgress(id, progress, speed);
  }

  let downloadProgressListenerRef: any;

  function removeDownloadProgressListener() {
    if (!downloadProgressListenerRef) return;
    downloadProgressListenerRef();
  }

  onMounted(async () => {
    models.value = (await getModelList()) as IModel[];
    downloadProgressListenerRef = window.electron.ipcRenderer.on(
      'download-progress',
      (_, payload) => onDownloadProgress(payload)
    );
  });

  onUnmounted(() => {
    removeDownloadProgressListener();
  });
</script>

<template>
  <LayoutDefault class="no-scrollbar max-h-full overflow-y-scroll bg-white">
    <div
      class="mt-5 flex h-44 shrink-0 items-center justify-center rounded-xl border"
      :style="backgroundImage2"
    >
      <div class="w-96">
        <input
          v-model="search"
          class="mx-auto w-full rounded-lg bg-white p-2 text-sm outline-none"
          type="text"
          placeholder="Search"
        />
      </div>
    </div>
    <div v-if="results.length > 0" class="my-10 space-y-5 px-20">
      <LlmModelCard
        v-for="result in results"
        :key="result.item?.id"
        :model-id="result.item?.id"
        :title="result.item?.title"
        :details="result.item?.details"
        :hf-params="result.item?.hf_params"
        :background-image="backgroundImage"
        @download="(id) => onDownloadModel(id)"
        @stop="(id) => onAbortDownload(id)"
      />
    </div>
    <div v-else>
      <div class="flex h-96 items-center justify-center">
        <p class="text-2xl">No models found</p>
      </div>
    </div>
  </LayoutDefault>
</template>
