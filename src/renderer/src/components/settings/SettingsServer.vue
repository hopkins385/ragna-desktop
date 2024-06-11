<script setup lang="ts">
import Button from '@renderer/components/ui/button/Button.vue';
import { Separator } from '@ui/separator'
import { ref, onMounted } from 'vue';

const serverStatus = ref(false)

async function startServer() {
  await window.electron.ipcRenderer.invoke('start-server')
  serverStatus.value = true
}

async function stopServer() {
  await window.electron.ipcRenderer.invoke('stop-server')
  serverStatus.value = false
}

async function getServerStatus() {
  return await window.electron.ipcRenderer.invoke('get-server-status')
}

onMounted(async () => {
  serverStatus.value = await getServerStatus()
})

const example = {
  "model": "",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant. Your name is Sven"
    },
    {
      "role": "user",
      "content": "Hello. Who are you?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "stream": true
}
</script>
<template>
  <div>
    <h3 class="text-lg font-medium">Local Server</h3>
    <p class="text-muted-foreground text-sm">
      The local server exposes an OpenAI compatible api endpoint to interact with the AI model.
    </p>
  </div>
  <Separator />
  <div>
    <div v-if="serverStatus" class="flex space-x-2 items-center">
      <div class=" rounded-full size-2 bg-green-500 "></div>
      <p class="text-sm">Server is running on Port 3000</p>
    </div>
    <div v-else class="flex space-x-2 items-center">
      <div class=" rounded-full size-2 bg-destructive/50"></div>
      <p class="text-sm">Server is not running</p>
    </div>
  </div>
  <div class="w-fit flex flex-col space-y-2">
    <Button @click="startServer">Start Server</Button>
    <Button @click="stopServer">Stop Server</Button>
  </div>
  <div>
    <h2 class="pb-2">Example Request</h2>
    <p class="text-sm pb-2">http://localhost:3000/v1/chat/completions</p>
    <code>
    <pre class="text-xs">
{{ example }}
    </pre>
  </code>
  </div>
</template>
