<script setup lang="ts">
import { HelpCircleIcon, PanelLeftIcon, SettingsIcon } from 'lucide-vue-next'
import IconRagna from '@/assets/svg/ragna-logo-min.svg'
import { useSettingsStore } from '@renderer/stores/settings.store';

const settings = useSettingsStore()
</script>

<template>
  <div id="custom-title-bar" class="flex shrink-0 flex-row items-center justify-between bg-neutral-900">
    <div class="custom-title-bar-drag-region flex items-center justify-center pl-20">
      <div class="pl-1">
        <IconRagna class="size-4" />
      </div>
      <div class="flex items-center justify-center space-x-1 whitespace-nowrap pl-2 text-sm text-neutral-300">
        <div class="font-semibold tracking-wide">RAGNA</div>
        <div class="text-neutral-400">Desktop</div>
      </div>
    </div>
    <div class="custom-title-bar-drag-region size-full"></div>
    <div class="group flex items-center space-x-6 text-neutral-400">
      <button aria-label="Settings" class="cursor-pointer py-2 pl-2 hover:text-neutral-200"
        @click="() => settings.toggleSidebar()">
        <PanelLeftIcon class="stroke-1.5 size-5 shrink-0" />
      </button>
      <button aria-label="Settings" class="cursor-pointer py-2 hover:text-neutral-200"
        @click="$router.push('/settings')">
        <SettingsIcon class="stroke-1.5 size-5 shrink-0" />
      </button>
      <button aria-label="About" class="cursor-pointer py-2 pr-6 hover:text-neutral-200"
        @click="$router.push('/about')">
        <HelpCircleIcon class="stroke-1.5 size-5 shrink-0" />
      </button>
    </div>
  </div>
</template>
