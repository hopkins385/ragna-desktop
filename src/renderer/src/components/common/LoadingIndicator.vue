<script setup lang="ts">
import { useIndicatorStore } from '@/stores/indicator.store'
import { onMounted } from 'vue';

const indicator = useIndicatorStore()

onMounted(() => {
  window.electron.ipcRenderer.on('update-llm-loading-progress', (_, progress) => indicator.setGlobalProgressValue(progress))
})
</script>

<template>
  <div v-if="indicator.showGlobalProgress" class="absolute inset-0 z-10 h-1" :style="{
    background: `repeating-linear-gradient(to right,#00dc82 0%,#34cdfe 50%,#0047e1 100%)`,
    width: `${indicator.globalProgress}%`
  }"></div>
</template>
