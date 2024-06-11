<script setup lang="ts">
import { Separator } from '@ui/separator'
import UnavailableInPreview from '../common/UnavailableInPreview.vue'
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">AI Model</h3>
    <p class="text-sm text-muted-foreground">
      Update your Large Language Model settings. Set your preferred preset and context length.
    </p>
  </div>
  <Separator />
  <UnavailableInPreview />
  <div class="hidden">
    <ul>
      <li>Default Preset: ChatML</li>
      <li>Default System Prompt</li>
      <li>Context Length</li>
      <li>Context Overflow Policy</li>
    </ul>
  </div>
</template>
