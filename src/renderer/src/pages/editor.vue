<script setup lang="ts">
import EditorBox from '@/components/editor/EditorBox.vue'
import { useEditorStore } from '../stores/editor.store'

const editor = useEditorStore()
</script>

<template>
  <div class="w-full">
    <EditorBox v-model="editor.content" />
  </div>
</template>
