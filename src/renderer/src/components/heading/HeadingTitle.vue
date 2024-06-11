<script setup lang="ts">
defineProps<{
  title: string
}>()

</script>

<template>
  <div class="py-10">
    <h1 class="font-semibold text-2xl">
      {{ title }}
    </h1>
  </div>
</template>
