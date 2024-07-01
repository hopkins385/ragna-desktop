<script setup lang="ts">
  import { FileCheckIcon, Loader2Icon, XIcon } from 'lucide-vue-next';

  defineProps<{
    isLoading: boolean;
  }>();
  defineEmits<{
    remove: [];
  }>();
</script>

<template>
  <div
    class="group flex h-12 w-10 items-center justify-center rounded-md border bg-slate-100 shadow-sm"
  >
    <button
      v-if="!isLoading"
      class="bg-destructive absolute -right-1 -top-1 hidden size-4 cursor-pointer items-center justify-center rounded-full group-hover:flex"
      @click="$emit('remove')"
    >
      <XIcon class="size-2.5 stroke-2 text-white" />
    </button>
    <Loader2Icon v-if="isLoading" class="stroke-1.5 text-primary size-4 animate-spin opacity-75" />
    <FileCheckIcon v-else class="stroke-1.5 text-primary size-5 opacity-75" />
  </div>
</template>
