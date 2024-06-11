<script setup lang="ts">
import { Separator } from '@ui/separator'
import UnavailableInPreview from '../common/UnavailableInPreview.vue'
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">Account</h3>
    <p class="text-sm text-muted-foreground">
      Update your account settings. Set your preferred language and timezone.
    </p>
  </div>
  <Separator />
  <UnavailableInPreview />
</template>
