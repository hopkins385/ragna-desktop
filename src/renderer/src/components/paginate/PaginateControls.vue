<script setup lang="ts">
  import {
    Pagination,
    PaginationEllipsis,
    PaginationFirst,
    PaginationLast,
    PaginationList,
    PaginationListItem,
    PaginationNext,
    PaginationPrev
  } from '@/components/ui/pagination';

  import { Button } from '@/components/ui/button';

  defineProps<{
    page: number | undefined;
    total: number | undefined;
  }>();

  defineEmits<{
    'update:page': [number];
  }>();
</script>

<template>
  <Pagination
    :page="page"
    :total="total"
    :sibling-count="1"
    show-edges
    :default-page="1"
    @update:page="(v) => $emit('update:page', v)"
  >
    <PaginationList v-slot="{ items }" class="flex items-center gap-1">
      <PaginationFirst />
      <PaginationPrev />

      <template v-for="(item, index) in items">
        <PaginationListItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
          <Button class="h-10 w-10 p-0" :variant="item.value === page ? 'default' : 'outline'">
            {{ item.value }}
          </Button>
        </PaginationListItem>
        <PaginationEllipsis v-else :key="item.type" :index="index" />
      </template>

      <PaginationNext />
      <PaginationLast />
    </PaginationList>
  </Pagination>
</template>
