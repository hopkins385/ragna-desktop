<script setup lang="ts">
import {
  LoaderIcon,
  MessageCircleOffIcon,
  PlayIcon,
  StepForwardIcon,
  SendIcon,
  MessageSquarePlusIcon
} from 'lucide-vue-next'


defineProps<{
  name: string
}>()

function getIcon(name: string) {
  return {
    loading: LoaderIcon,
    message: MessageCircleOffIcon,
    play: PlayIcon,
    stop: StepForwardIcon,
    send: SendIcon,
    eject: StepForwardIcon,
    newChat: MessageSquarePlusIcon,
  }[name]
}
</script>

<template>
  <component :is="getIcon(name)" class="stroke-1.5" />
</template>
