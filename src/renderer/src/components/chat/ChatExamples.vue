<script setup lang="ts">
defineEmits<{
  runExample: [input: string]
}>()

const examples = [
  {
    title: 'Erstelle einen Blog Post',
    prompt:
      'Erstelle einen Blog Post über die Vorteile von künstlicher Intelligenz für mittelständische Unternehmen. Nutze Markdown für die Formatierung.'
  },
  {
    title: 'Develop a marketing strategy',
    prompt:
      'Develop a marketing strategy to increase brand awareness and customer engagement. The strategy should be for the next 3 months. Use markdown for formatting.'
  },
  {
    title: 'Erstelle einen Social Media Plan',
    prompt:
      'Erstelle einen Social Media Plan für die nächsten 3 Monate der zu einer Steigerung der Markenbekanntheit und Kundenbindung führt. Nutze Markdown für die Formatierung.'
  },
  {
    title: 'Create a strategy for a new product launch',
    prompt:
      'Create a strategy for a new product launch. The strategy should be for the next 3 months. Use markdown for formatting.'
  }
]
</script>

<template>
  <div class="flex justify-center">
    <div class="grid grid-cols-2 gap-3">
      <div class="col-span-2 pb-4 text-center text-sm font-semibold">Try an example:</div>
      <div
        v-for="(exmaple, index) in examples"
        :key="index"
        class="cursor-pointer rounded-lg border px-6 py-3 text-sm hover:bg-slate-100"
        @click="$emit('runExample', exmaple.prompt)"
      >
        {{ exmaple.title }}
      </div>
    </div>
  </div>
</template>
