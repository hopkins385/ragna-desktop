<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import DeleteButton from '@/components/common/DeleteButton.vue'
import OutButton from '../common/OutButton.vue';

defineProps<{
  documents: any
}>()

const emit = defineEmits<{
  delete: [string]
  open: [string]
}>()

function onDelete(id: string) {
  emit('delete', id)
}

function onOpenDocument(id: string) {
  emit('open', id)
}
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>
          Title
        </TableHead>
        <TableHead class="whitespace-nowrap">Created At</TableHead>
        <TableHead class="text-right">
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="document in documents" :key="document.id">
        <TableCell class="font-medium">
          {{ document.title }}
        </TableCell>
        <TableCell>
          {{ document?.createdAt }}
        </TableCell>
        <TableCell class="text-right space-x-2">
          <OutButton @click="() => onOpenDocument(document.id)" />
          <DeleteButton @click="() => onDelete(document.id)" />
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
