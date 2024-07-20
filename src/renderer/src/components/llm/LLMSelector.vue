<script setup lang="ts">
  import { onMounted, ref, computed, watch } from 'vue';
  import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
  } from '@ui/select';
  import useFetchModel from '@/composables/useFetchModel';
  import type { SelectionList } from '@/composables/useFetchModel';

  const { fetchModels } = useFetchModel();

  const modelValue = defineModel<string | undefined>({
    type: String,
    default: undefined
  });

  const props = defineProps<{
    modelsFolderPath: string | undefined;
    disabled: boolean;
  }>();

  const items = ref<SelectionList[]>([]);

  const placeholder = computed(() =>
    items.value.length > 0 ? 'Select a model ...' : 'No models found'
  );

  async function initModels() {
    console.log('Fetching models');
    try {
      items.value = await fetchModels();
    } catch (error) {
      console.error('Error fetching models', error);
    }
  }

  watch(
    () => props.modelsFolderPath,
    async () => {
      if (props.modelsFolderPath) {
        await initModels();
      }
    },
    { immediate: false }
  );

  onMounted(async () => {
    await initModels();

    window.electron.ipcRenderer.on('download-completed', async () => {
      await initModels();
    });
  });
</script>

<template>
  <Select
    v-model="modelValue"
    @update:open="
      (v) => {
        if (v === true) initModels();
      }
    "
  >
    <SelectTrigger :disabled="disabled">
      <SelectValue :placeholder="placeholder" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem
          v-for="item in items"
          :key="item.id"
          :selected="item.filePath === modelValue"
          :value="item.filePath"
        >
          {{ item.title }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
