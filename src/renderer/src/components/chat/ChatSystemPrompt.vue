<script setup lang="ts">
import { useChatSettingsStore } from '@/stores/chat-settings.store'

import { Textarea } from '@ui/textarea'
import { Button } from '@ui/button'
import { ref, watch } from 'vue';

const oldSystemPrompt = ref('')

const settings = useChatSettingsStore()

const onDoneClick = () => {
  settings.setShowEditSystemPrompt(false)
}

watch(
  () => settings.getShowEditSystemPrompt,
  (val) => {
    // on open
    if (val) {
      oldSystemPrompt.value = settings.getSystemPrompt
    } else {
      // on close
      // check if the system prompt has changed
      if (oldSystemPrompt.value !== settings.getSystemPrompt) {
        settings.setSystemPromptHasChanged(true)
      }
    }

  })
</script>

<template>
  <div v-show="settings.getShowEditSystemPrompt" class="sticky inset-0 z-10">
    <div class="rounded-lg border bg-white p-5 shadow-lg">
      <div class="mb-2 text-sm font-semibold">System Prompt:</div>
      <Textarea v-model="settings.systemPrompt" class="h-32 border-b p-3" />
      <div class="mt-4 flex justify-end">
        <Button variant="outline" @click="onDoneClick">Done</Button>
      </div>
    </div>
  </div>
</template>
