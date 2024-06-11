<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Separator } from '@ui/separator'
const log = ref('')
const getAppLog = async () => {
  const result = await window.electron.ipcRenderer.invoke('get-app-log')
  log.value = result
}
onMounted(async () => {
  await getAppLog()
})
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">App Logs</h3>
    <p class="text-sm text-muted-foreground">View logs for the app.</p>
  </div>
  <Separator />
  <div ref="logContainerRef" class="max-h-96 min-h-96 max-w-full overflow-scroll border">
    <pre class="text-xxs">{{ log }}</pre>
  </div>
</template>
