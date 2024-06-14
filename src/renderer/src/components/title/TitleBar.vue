<script setup lang="ts">
  import {
    HelpCircleIcon,
    MinusIcon,
    PanelLeftIcon,
    SettingsIcon,
    SquareIcon,
    XIcon
  } from 'lucide-vue-next';
  import IconRagna from '@/assets/svg/ragna-logo-min.svg';
  import { useSettingsStore } from '@renderer/stores/settings.store';

  const settings = useSettingsStore();

  const isWin = navigator.userAgent.includes('Win');

  function onWinMinimze() {
    window.electron.ipcRenderer.send('win:minimize');
  }

  function onWinMaximize() {
    window.electron.ipcRenderer.send('win:toggle-fullscreen');
  }

  function onWinClose() {
    window.electron.ipcRenderer.send('win:close');
  }
</script>

<template>
  <div
    id="custom-title-bar"
    class="flex shrink-0 flex-row items-center justify-between bg-neutral-900"
  >
    <div
      class="custom-title-bar-drag-region flex items-center justify-center"
      :class="{ 'pl-20': !isWin, 'pl-5': isWin }"
    >
      <div class="pl-1">
        <IconRagna class="size-4" />
      </div>
      <div
        class="flex items-center justify-center space-x-1 whitespace-nowrap pl-2 text-sm text-neutral-300"
      >
        <div class="font-semibold tracking-wide">RAGNA</div>
        <div class="text-neutral-400">Desktop</div>
      </div>
    </div>
    <div class="custom-title-bar-drag-region size-full"></div>
    <div class="group flex items-center space-x-6 text-neutral-400">
      <button
        aria-label="Settings"
        class="cursor-pointer py-2 pl-2 hover:text-neutral-200"
        @click="() => settings.toggleSidebar()"
      >
        <PanelLeftIcon class="stroke-1.5 size-5 shrink-0" />
      </button>
      <button
        aria-label="Settings"
        class="cursor-pointer py-2 hover:text-neutral-200"
        @click="$router.push('/settings')"
      >
        <SettingsIcon class="stroke-1.5 size-5 shrink-0" />
      </button>
      <button
        aria-label="About"
        class="cursor-pointer py-2 pr-6 hover:text-neutral-200"
        @click="$router.push('/about')"
      >
        <HelpCircleIcon class="stroke-1.5 size-5 shrink-0" />
      </button>
    </div>
    <div
      v-if="isWin"
      class="flex w-40 items-center justify-center space-x-4 border-0 pr-2 text-neutral-400"
    >
      <button
        aria-label="Minimize"
        class="cursor-pointer py-2 hover:text-neutral-200"
        @click="onWinMinimze()"
      >
        <MinusIcon class="stroke-1.5 mt-0 size-5 shrink-0" />
      </button>
      <button
        aria-label="Full Screen"
        class="cursor-pointer py-2 hover:text-neutral-200"
        @click="onWinMaximize()"
      >
        <SquareIcon class="stroke-1.5 size-4 shrink-0" />
      </button>
      <button
        aria-label="Close"
        class="cursor-pointer py-2 hover:text-neutral-200"
        @click="onWinClose()"
      >
        <XIcon class="stroke-1.5 size-5 shrink-0" />
      </button>
    </div>
  </div>
</template>
