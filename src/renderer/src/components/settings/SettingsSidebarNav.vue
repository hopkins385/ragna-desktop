<script setup lang="ts">
import { cn } from '@/lib/utils'
import { Button } from '@ui/button'
import { useSettingsStore } from '@/stores/settings.store'

const settings = useSettingsStore()
</script>

<template>
  <nav class="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
    <Button
      v-for="(item, index) in settings.sidebarNavItems"
      :key="index"
      variant="ghost"
      :class="
        cn(
          'w-full text-left justify-start',
          settings.activeNavPath === `${item.path}` && 'bg-muted hover:bg-muted'
        )
      "
      @click="settings.setActiveNavPath(item.path)"
    >
      {{ item.title }}
    </Button>
  </nav>
</template>
