<template>
  <TicketCard ref="ticketCardRef" :fields="fields" />
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import TicketCard from './components/TicketCard.vue';
import { initArchiveTicket } from './runtime/archive-ticket';
import { initAutoImport } from './runtime/auto-import';
import { readTicketFields } from './runtime/fields';

const fields = readTicketFields();
const ticketCardRef = ref<InstanceType<typeof TicketCard> | null>(null);

onMounted(async () => {
  await nextTick();

  const root = ticketCardRef.value?.rootElement;
  if (!root) return;

  initAutoImport(root);
  initArchiveTicket(root);
});
</script>
