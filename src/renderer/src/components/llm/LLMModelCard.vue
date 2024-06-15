<script setup lang="ts">
  import { useDownloadsStore } from '@/stores/download.store';
  import { Button } from '@ui/button';
  import { CheckIcon, ExternalLinkIcon, RotateCcwIcon, SquareIcon } from 'lucide-vue-next';

  const props = defineProps<{
    modelId: string;
    title: string;
    details: any;
    hfParams: any;
    backgroundImage: any;
  }>();
  defineEmits<{
    download: [modelId: string];
    stop: [modelId: string];
  }>();

  const downloads = useDownloadsStore();
  const size = (props.hfParams.file_size / 100).toPrecision(2);

  const getLanguage = (lang: string) => {
    return lang === 'en' ? 'English' : 'German';
  };

  const getSize = (size: number) => {
    return (size / 10).toPrecision(2);
  };
</script>

<template>
  <div class="overflow-hidden rounded-xl border bg-white">
    <div class="relative h-52" :style="backgroundImage">
      <div class="absolute inset-0 h-10 space-y-3 p-4">
        <div class="flex justify-end space-x-2">
          <span class="text-xxs rounded-full bg-slate-200/90 px-3 py-1">
            {{ getSize(details.model_paramaters) }} Billion
          </span>
        </div>
        <div class="flex justify-end space-x-2">
          <span
            v-for="(lang, index) in details.languages"
            :key="index"
            class="text-xxs rounded-full bg-slate-200/90 px-3 py-1"
          >
            {{ getLanguage(lang) }}
          </span>
        </div>
      </div>
    </div>
    <div class="relative flex min-h-20 items-center justify-between p-5">
      <div>
        <h2 class="text-sm font-semibold">{{ title }}</h2>
        <p class="py-3 pr-20 text-sm">{{ details.description }}</p>
        <a
          :href="details.repo_link"
          target="_blank"
          class="flex w-fit cursor-pointer items-center space-x-1 pb-2 text-xs text-blue-800 hover:underline"
        >
          <span>Learn More</span>
          <span>
            <ExternalLinkIcon class="stroke-1.5 size-3" />
          </span>
        </a>
        <div class="pt-2 text-xs">File size: {{ size }} GB</div>
        <div class="pt-2 text-xs">Quantization: {{ details.quant }}</div>
        <div class="pt-2 text-xs">License: {{ details.license }}</div>
      </div>
      <div v-if="downloads.isDownloadCompleted(modelId)" class="flex items-center justify-center">
        <div class="px-4">
          <CheckIcon class="size-4 text-green-700" />
        </div>
        <Button variant="outline">
          <RotateCcwIcon class="size-4" />
        </Button>
      </div>
      <div v-else class="flex flex-col items-center">
        <div class="flex items-center">
          <Button
            v-if="downloads.isDownloadPending(modelId)"
            variant="outline"
            size="icon"
            class="mr-2"
            @click="$emit('stop', modelId)"
          >
            <SquareIcon class="size-4 fill-slate-800 stroke-none" />
          </Button>
          <Button
            variant="outline"
            :disabled="downloads.isDownloadPending(modelId)"
            @click="$emit('download', modelId)"
          >
            {{
              downloads.isDownloadPending(modelId)
                ? Number(downloads.getProgressById(modelId)) < 100
                  ? `In Progress (${downloads.getProgressById(modelId)}%)`
                  : 'Done'
                : 'Download'
            }}
          </Button>
        </div>
        <div v-if="downloads.isDownloadPending(modelId)" class="text-xxs pt-5 opacity-60">
          Speed: {{ downloads.getDlSpeedById(modelId) }} MB/s
        </div>
      </div>
      <div class="absolute bottom-0 left-0 w-full">
        <div
          v-if="downloads.getProgressById(modelId)"
          class="h-2 bg-blue-500"
          :style="{ width: downloads.getProgressById(modelId) + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>
