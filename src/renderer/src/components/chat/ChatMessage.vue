<script setup lang="ts">
import { ref, watch } from 'vue'
import { useClipboard } from '@vueuse/core'
import {
  CheckSquareIcon,
  ClipboardCheckIcon,
  ClipboardIcon,
  EditIcon,
  XCircleIcon
} from 'lucide-vue-next'
import useMarkdown from '@/composables/useMarkdown'

const isEditable = ref(false)
const tempMessage = ref('')

const props = defineProps<{
  id: number
  role: 'user' | 'assistant' | 'system'
  content: string
}>()

const emit = defineEmits<{
  update: [
    {
      id: number
      content: string
    }
  ]
  delete: [number]
  again: [number]
}>()

const { render } = useMarkdown()
const { copy, copied, isSupported } = useClipboard()

const toggleEditable = () => {
  isEditable.value = !isEditable.value
}

const updateTempMessage = (event: Event) => {
  tempMessage.value = (event.target as HTMLDivElement).innerText
}

const emitUpdate = () => {
  emit('update', {
    id: props.id,
    content: tempMessage.value
  })
  tempMessage.value = ''
}

watch(
  () => isEditable.value,
  (val) => {
    if (val === false) {
      emitUpdate()
    } else {
      tempMessage.value = props.content
    }
  }
)
</script>

<template>
  <div v-if="role !== 'system'">
    <div class="group relative flex py-2">
      <div class="ml-12 w-16 shrink-0 text-slate-500">{{ role == 'assistant' ? 'AI' : 'Me' }}:</div>
      <div class="relative w-full max-w-2xl rounded-lg">
        <div :id="`chat-message-${id}`" v-dompurify-html="render(content)" :contenteditable="isEditable"
          class="prose prose-slate rounded-lg outline-none"
          :class="{ 'border p-4 outline outline-slate-100': isEditable }" @input="(event) => updateTempMessage(event)">
        </div>
        <div v-if="isEditable" class="absolute bottom-1 right-7">
          <button @click="toggleEditable">
            <CheckSquareIcon class="stroke-1.5 size-4 text-slate-500 hover:text-slate-900" />
          </button>
        </div>
      </div>
      <div class="absolute right-0 top-0 bg-white text-sm text-slate-500">
        <div v-if="!isEditable" class="hidden flex-col group-hover:flex">
          <div class="flex space-x-3 rounded-md border border-slate-100 p-1 shadow-sm">
            <!--
            <button @click="emit('delete', id)">
              <XCircleIcon class="stroke-1.5 size-4 hover:text-slate-900" />
            </button>
            <button @click="toggleEditable">
              <EditIcon class="stroke-1.5 size-4 hover:text-slate-900" />
            </button>
            -->
            <button v-if="isSupported" class="flex items-center justify-center hover:text-slate-900"
              @click="copy(content)">
              <!-- by default, `copied` will be reset in 1.5s
          hidden group-hover:block
          -->
              <span v-if="!copied">
                <ClipboardIcon class="stroke-1.5 size-4" />
              </span>
              <span v-else>
                <ClipboardCheckIcon class="stroke-1.5 size-4" />
              </span>
            </button>
          </div>
          <!-- div v-if="role === 'user'"
            class="cursor-pointer space-x-3 rounded-md border border-slate-100 p-1 px-2 text-center text-xs shadow-sm"
            @click="emit('again', id)">
            Again
          </!-->
        </div>
      </div>
    </div>
  </div>
</template>
