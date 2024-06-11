<script setup lang="ts">
import { SquareIcon } from 'lucide-vue-next'
</script>

<template>
  <div class="relative">
    <div class="absolute left-1/2 top-1/2" :style="{ transform: 'translate(-50%, -50%)' }">
      <SquareIcon class="stroke-1.5 size-3 border-0 fill-slate-700 stroke-0" />
    </div>
    <div class="loader relative size-7 rounded-full border border-gray-200 ease-linear">
      <div class="size-full"></div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loader {
  border-top-color: black;
  animation: spin 1s linear infinite;
}
</style>
