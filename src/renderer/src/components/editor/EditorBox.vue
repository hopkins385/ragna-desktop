<script setup lang="ts">
import { ref, onBeforeUnmount, computed, watch } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { StarterKit } from '@tiptap/starter-kit'
import { Highlight } from '@tiptap/extension-highlight'
import { Underline } from '@tiptap/extension-underline'
import { AI } from './extensions/ai-extension'
import useRunCompletion from './composables/useRunCompletion'
import EditorMenu from './EditorMenu.vue'

const props = defineProps<{
  modelValue: string
}>()

const emits = defineEmits(['update:modelValue'])
const { runCompletion, isLoading } = useRunCompletion()

const editorWrapperRef = ref<Element | null>(null)
const showInstructionMenu = ref(false)

const editor = new Editor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Highlight,
    Underline,
    AI.configure({
      lang: 'en',
      completionHandler: runCompletion
    })
  ],
  onUpdate: ({ editor }) => {
    emits('update:modelValue', editor.getHTML())
  },
  autofocus: 'end'
})

const showLoading = computed(() => {
  return isLoading.value
})

// if is loading set editable to false
watch(showLoading, (value) => {
  editor.setOptions({ editable: !value })
})

function toggleInstructionMenu() {
  showInstructionMenu.value = !showInstructionMenu.value
}

onBeforeUnmount(() => {
  editor.destroy()
})
</script>

<template>
  <div id="text-editor" class="relative overflow-hidden size-full">
    <!-- Menu -->
    <EditorMenu :editor="editor" :is-loading="showLoading" @toggle-instruction-menu="toggleInstructionMenu" />
    <!-- Content -->
    <EditorContent id="editor-content-wrapper" ref="editorWrapperRef" :editor="editor"
      :class="showLoading ? 'pointer-events-none opacity-50' : 'pointer-events-auto'" />
  </div>
</template>
