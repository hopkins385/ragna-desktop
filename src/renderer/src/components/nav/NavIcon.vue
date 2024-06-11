<script setup lang="ts">
import {
  FolderIcon,
  SettingsIcon,
  PencilLineIcon,
  MessageSquareTextIcon,
  BotIcon,
  FileIcon,
  DownloadIcon,
  HistoryIcon
} from 'lucide-vue-next'

const props = defineProps<{
  title?: string
  iconName: string
  isActive: boolean
}>()

const getIcon = () => {
  return {
    chat: MessageSquareTextIcon,
    editor: PencilLineIcon,
    folder: FolderIcon,
    files: FileIcon,
    settings: SettingsIcon,
    bot: BotIcon,
    download: DownloadIcon,
    history: HistoryIcon
  }[props.iconName]
}
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <div class="rounded-lg p-2" :class="isActive ? 'bg-slate-100' : ''">
      <component :is="getIcon()"
        class="stroke-1.5 size-5 shrink-0 text-slate-600 transition-all group-hover:scale-105 group-hover:stroke-2 group-hover:text-slate-800" />
    </div>
    <p class="text-xs">{{ title ?? '' }}</p>
  </div>
</template>
