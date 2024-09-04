<script setup lang="ts">
  import { useSettingsStore } from '@renderer/stores/settings.store';
  import NavIcon from './NavIcon.vue';

  const settings = useSettingsStore();
</script>

<template>
  <div
    class="shrink-0 transition-all duration-300"
    :class="{
      'w-0 opacity-0': !settings.sidebarIsVisible,
      'w-18 opacity-100': settings.sidebarIsVisible
    }"
  >
    <div class="flex size-full shrink-0 flex-col justify-between">
      <ul class="space-y-2 pt-8">
        <!-- li class="group cursor-pointer pb-2" @click="$router.push('/editor')">
          <NavIcon
            title="Editor"
            icon-name="editor"
            :is-active="$router.currentRoute.value.path === '/editor'"
          />
        </!-->
        <li class="group cursor-pointer pb-2" @click="$router.push('/')">
          <NavIcon
            title="Chat"
            icon-name="chat"
            :is-active="$router.currentRoute.value.path === '/'"
          />
        </li>
        <li class="group cursor-pointer pb-2" @click="$router.push('/chat-history')">
          <NavIcon
            title="History"
            icon-name="history"
            :is-active="$router.currentRoute.value.path === '/chat-history'"
          />
        </li>
        <!-- li class="group flex cursor-pointer items-center justify-center pb-2" @click="$router.push('/files')">
          <NavIcon title="Files" icon-name="folder" :is-active="$router.currentRoute.value.path === '/files'" />
        </!-->

        <li
          class="group flex cursor-pointer items-center justify-center pb-2"
          @click="$router.push('/models')"
        >
          <NavIcon
            title="Models"
            icon-name="download"
            :is-active="$router.currentRoute.value.path === '/models'"
          />
        </li>
        <!--
        <li
          class="group flex cursor-pointer items-center justify-center pt-2"
          @click="$router.push('/chat-pdf')"
        >
          <NavIcon
            title="Files"
            icon-name="files"
            :is-active="$router.currentRoute.value.path === '/chat-pdf'"
          />
        </li>
        -->
      </ul>
    </div>
  </div>
</template>
