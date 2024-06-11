<script setup lang="ts">
import { useSettingsStore } from '@renderer/stores/settings.store';
import NavIcon from './NavIcon.vue'

const settings = useSettingsStore()
</script>

<template>
  <div class="transition-all duration-300 shrink-0" :class="{
    'opacity-0 w-0': !settings.sidebarIsVisible,
    'opacity-100 w-18': settings.sidebarIsVisible
  }
    ">
    <div class="flex size-full shrink-0 flex-col justify-between">
      <ul class="space-y-2 pt-8">
        <li class="group cursor-pointer pb-2" @click="$router.push('/editor')">
          <NavIcon title="Editor" icon-name="editor" :is-active="$router.currentRoute.value.path === '/editor'" />
        </li>
        <li class="group cursor-pointer pb-2" @click="$router.push('/')">
          <NavIcon title="Chat" icon-name="chat" :is-active="$router.currentRoute.value.path === '/'" />
        </li>
        <li class="group cursor-pointer pb-2" @click="$router.push('/chat-history')">
          <NavIcon title="History" icon-name="history"
            :is-active="$router.currentRoute.value.path === '/chat-history'" />
        </li>
        <li class="group flex cursor-pointer items-center justify-center pb-2" @click="$router.push('/files')">
          <NavIcon title="Files" icon-name="folder" :is-active="$router.currentRoute.value.path === '/files'" />
        </li>
        <li class="group flex cursor-pointer items-center justify-center pb-2" @click="$router.push('/models')">
          <NavIcon title="Models" icon-name="download" :is-active="$router.currentRoute.value.path === '/models'" />
        </li>
        <!-- li
        class="group flex cursor-pointer items-center justify-center pt-2"
        @click="$router.push('/files')"
      >
        <NavIcon
          title="Files"
          icon-name="files"
          :is-active="$router.currentRoute.value.path === '/files'"
        />
      </!-->
      </ul>
    </div>
  </div>
</template>
