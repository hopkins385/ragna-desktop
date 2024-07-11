<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { useModelStore } from '@renderer/stores/model.store';
  import { Button } from '@ui/button';
  import useChat from '@renderer/composables/useChat';
  import LLMSelector from '@renderer/components/llm/LLMSelector.vue';
  import ChatSettingsDropdown from '@renderer/components/chat/ChatSettingsDropdown.vue';
  import Icon from '@renderer/components/common/Icon.vue';

  const model = useModelStore();
  const loadModelLocked = computed(() => {
    return (
      !model.modelPath || model.isModelLoaded === true || model.isModelLoadingInProgress === true
    );
  });
  const { onLoadModel, onEjectModel, onAbortLoadingModel } = useChat();

  async function getModelsFolderPath() {
    try {
      const result = await window.electron.ipcRenderer.invoke('get-models-folder-path');
      model.setModelsFolderPath(result);
    } catch (error) {
      console.error(error);
    }
  }

  onMounted(async () => {
    await getModelsFolderPath();
  });
</script>

<template>
  <div class="flex w-full items-center">
    <!-- AI Model Selector -->
    <div class="mx-5 flex w-full items-center space-x-5 text-slate-600">
      <div class="-ml-3 whitespace-nowrap text-sm">AI Model:</div>
      <div class="grow">
        <LLMSelector
          v-model="model.modelPath"
          :models-folder-path="model.getModelsFolderPath"
          :disabled="model.isModelLoaded || model.isModelLoadingInProgress"
        />
      </div>

      <Button
        v-if="!model.isModelLoaded && !model.isModelLoadingInProgress"
        variant="outline"
        :disabled="loadModelLocked"
        class="shrink-0"
        @click="() => onLoadModel(model.modelPath)"
      >
        <Icon name="play" class="mr-2 size-4 stroke-2" />
        Load
      </Button>
      <Button
        v-else-if="model.isModelLoadingInProgress"
        variant="outline"
        class="shrink-0"
        @click="() => onAbortLoadingModel()"
      >
        <Icon name="loading" class="stroke-1.5 my-2 size-4 animate-spin" />
      </Button>
      <Button v-else variant="outline" class="shrink-0" @click="onEjectModel">
        <Icon name="eject" class="mr-2 size-4 -rotate-90 stroke-2" />
        Eject
      </Button>
    </div>
    <ChatSettingsDropdown />
  </div>
</template>
