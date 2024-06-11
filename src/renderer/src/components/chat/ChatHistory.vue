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
  chats: any
}>()

const emit = defineEmits<{
  delete: [string]
  openChat: [string]
}>()

function onDelete(id: string) {
  emit('delete', id)
}

function onOpenChat(id: string) {
  emit('openChat', id)
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
      <TableRow v-for="chat in chats" :key="chat.id">
        <TableCell class="font-medium">
          {{ chat.title }}
        </TableCell>
        <TableCell>
          {{ chat.createdAt }}
        </TableCell>
        <TableCell class="text-right space-x-2">
          <OutButton @click="onOpenChat(chat.id)" />
          <DeleteButton @click="onDelete(chat.id)" />
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
