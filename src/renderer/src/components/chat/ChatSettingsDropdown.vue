<script setup lang="ts">
import { ref } from 'vue'
import { useChatSettingsStore } from '@/stores/chat-settings.store'

import { Slider } from '@ui/slider'
import { SlidersHorizontalIcon, RotateCcwIcon } from 'lucide-vue-next'

import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover'
import { Separator } from '@ui/separator'
import { Button } from '@ui/button'
import InfoTooltip from '../common/InfoTooltip.vue'

const show = ref(false)
const settings = useChatSettingsStore()

const onEditSystemPromptClick = () => {
  show.value = false
  settings.setShowEditSystemPrompt(true)
}
</script>

<template>
  <Popover v-model:open="show">
    <PopoverTrigger class="rounded-lg border p-3">
      <SlidersHorizontalIcon class="size-4 text-primary/70" />
    </PopoverTrigger>
    <PopoverContent align="end" class="mt-1 w-60 text-sm">
      <div class="flex items-center justify-between">
        <span>Chat Settings</span>
        <button @click="settings.resetSettings()">
          <RotateCcwIcon class="size-3 opacity-60" />
        </button>
      </div>
      <Separator class="my-3" />
      <div class="mb-5 flex flex-col space-y-4">
        <div class="flex w-full justify-between">
          <div>
            System Prompt
            <InfoTooltip title="System Prompt"
              content="A system prompt is a way of providing context and instructions to your AI model, such as specifying a particular goal or role. It can be used to guide the AI's responses and keep it on track. A well-written system prompt can also increase the AI's ability to follow rules and instructions." />
          </div>
        </div>
        <Button variant="outline" @click="onEditSystemPromptClick">Edit System Prompt</Button>
      </div>
      <div class="my-5 flex flex-col space-y-4">
        <div class="flex w-full justify-between">
          <div>
            Temperature
            <InfoTooltip title="Temperature"
              content="The temperature regulates the randomness, or creativity, of the AI's responses. A higher temperature value typically makes the output more diverse and creative but might also increase its likelihood of straying from the context (e.g. system prompt). If you need the model to stay very focused, use zero as a starting point." />
          </div>
          <div>{{ settings.getTemperature }}</div>
        </div>
        <Slider v-model="settings.temperature" :default-value="[20]" :max="200" :step="1" class="slider" />
      </div>
      <!-- div class="mb-5 flex flex-col space-y-4">
        <div class="flex w-full justify-between">
          <div>
            Presence Penalty

            <InfoTooltip
              title="Presence Penalty"
              content="The presence penalty prevents the model from repeating phrases too often in its response. If you want the model to generate diverse or creative text, you might want to use a higher presence penalty (e.g. 0.5). Or, if you need the model to stay focused, try using a lower presence penalty."
            />
          </div>
          <div>{{ settings.getPresencePenalty }}</div>
        </div>
        <Slider
          v-model="settings.presencePenalty"
          :default-value="[0]"
          :min="-200"
          :max="200"
          :step="1"
          class="slider"
        />
      </!-->
      <div class="mb-5 flex flex-col space-y-4">
        <div class="flex w-full justify-between">
          <div>
            Max Tokens
            <InfoTooltip title="Max Tokens"
              content="The maximum number of tokens (words) to generate in the response. A higher value will make the model generate longer responses." />
          </div>
          <div>{{ settings.getMaxTokens }}</div>
        </div>
        <Slider v-model="settings.maxTokens" :default-value="[1024]" :max="4096" :step="1" class="slider" />
      </div>
    </PopoverContent>
  </Popover>
</template>

<style>
.slider {
  @apply [&_[role=slider]]:size-4 [&_[role=slider]]:border [&_[role=slider]]:hover:cursor-grab [&_[role=slider]]:active:cursor-grabbing;
}
</style>
