<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Trash2Icon } from 'lucide-vue-next'
</script>

<template>
  <Button variant="outline" size="icon" class=" opacity-70 hover:opacity-100">
    <Trash2Icon class="size-4 stroke-2 text-destructive" />
  </Button>
</template>
