<script setup lang="ts">
  import { Button } from '@ui/button';
  import { Loader2Icon } from 'lucide-vue-next';

  defineProps<{ firstTime: boolean }>();
  defineEmits(['cancel']);
</script>

<template>
  <div class="absolute inset-0 z-50 flex size-full bg-white/80 backdrop-blur-sm">
    <div
      class="absolute left-1/2 top-20 -translate-x-1/2 rounded-lg border bg-white p-10 shadow-md"
    >
      <div v-if="firstTime" class="flex w-96 flex-col space-y-10">
        <div>
          <h1 class="text-2xl font-bold">Loading Embedding Model</h1>
          <p class="pt-1 text-sm opacity-75">Additional resources are required</p>
        </div>
        <p>
          This is the first time you are using the embedding feature. Additional resources need to
          be loaded from Huggingface. This may take a while. Hang on.
        </p>
        <div>
          <ul class="rounded-lg border p-5 text-sm">
            <li class="underline">Ensure you have:</li>
            <li>Active internet connection</li>
            <li>Enough free disk space (> 500MB)</li>
            <li></li>
          </ul>
        </div>
        <div class="flex w-full items-center justify-center text-center">
          <Loader2Icon class="animate-spin opacity-75" />
        </div>
        <!-- Button variant="outline" @click="() => $emit('cancel')">Cancel</!-->
      </div>
      <div v-if="!firstTime" class="flex w-96 flex-col space-y-10">
        <div>
          <h1 class="text-2xl font-bold">Processing Data</h1>
          <p class="pt-1 text-sm opacity-75">Your data is being processed</p>
        </div>
        <div class="flex w-full items-center justify-center text-center">
          <Loader2Icon class="animate-spin opacity-75" />
        </div>
        <!-- Button variant="outline" @click="() => $emit('cancel')">Cancel</!-->
      </div>
    </div>
  </div>
</template>
