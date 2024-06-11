<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Separator } from '@ui/separator'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@ui/form'
import { Input } from '@ui/input'
import { Button } from '@ui/button'
import { Alert, AlertDescription, AlertTitle } from '@ui/alert'
import { toast } from 'vue-sonner'
import { AlertTriangleIcon } from 'lucide-vue-next'

const modelsFolderPath = ref('')

const setModelsFolderPath = async () => {
  // await window.api.setModelsFolderPath(modelsFolderPath.value)
  await window.electron.ipcRenderer.invoke('set-models-folder-path', modelsFolderPath.value)
  toast.success('AI Models folder path updated')
}

const getModelsFolderPath = async () => {
  const result = await window.electron.ipcRenderer.invoke('get-models-folder-path')
  modelsFolderPath.value = result
}

const onOpenFolderDialog = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('open-folder-dialog')
    if (!result) return
    modelsFolderPath.value = result
    setModelsFolderPath()
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  getModelsFolderPath()
})
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">Local Storage</h3>
    <p class="text-sm text-muted-foreground">
      Update your local storage settings. Set your AI Models storage location.
    </p>
  </div>
  <Separator />
  <div>
    <FormField v-slot="{ componentField }" v-model="modelsFolderPath" name="folder">
      <FormItem>
        <FormLabel>AI Models Folder</FormLabel>
        <FormControl>
          <div class="flex items-center justify-center space-x-4">
            <Input type="text" placeholder="/path/to/folder" v-bind="componentField" />
            <Button @click="onOpenFolderDialog">Change</Button>
          </div>
        </FormControl>
        <FormDescription> This is the folder where all your AI Models are stored. </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
  </div>
  <div class="pt-5">
    <Alert>
      <AlertTriangleIcon class="size-4 text-yellow-500" />
      <AlertTitle>Adding Models</AlertTitle>
      <AlertDescription>
        <p class="pt-1">
          Visit the
          <router-link to="/models" class="underline">model manager</router-link> to conveniently
          download models from huggingface. We have ensured that each model listed in the download
          manager is compatible and delivers high quality results.
        </p>
        <p class="pt-2">
          You can manually add models by placing the model file into your AI models folder. But be
          careful! Only models with the file extension <strong>.gguf</strong> are supported. Hint:
          The prompt-template will be automatically taken from the metadata of the model and
          defaults to ChatML in cases where it is not available.
        </p>
      </AlertDescription>
    </Alert>
  </div>
</template>
