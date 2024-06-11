<script setup lang="ts">
import { Separator } from '@ui/separator'
import UnavailableInPreview from '../common/UnavailableInPreview.vue'
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">Profile</h3>
    <p class="text-sm text-muted-foreground">
      Update your profile settings. Let the AI know more about you.
    </p>
  </div>
  <Separator />
  <UnavailableInPreview />
</template>
