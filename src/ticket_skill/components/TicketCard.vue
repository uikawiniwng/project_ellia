<template>
  <div ref="rootElement" class="et-layout-wrap-v9">
    <input :id="foldId" type="checkbox" class="et-fold-check-v9" />
    <TicketStamp :fold-id="foldId" />

    <div class="et-scene-v9">
      <input :id="flipId" type="checkbox" class="et-toggle-v9" />
      <label class="et-container-v9" :for="flipId">
        <TicketStub :date="fields.date" />
        <div class="et-main-wrapper">
          <TicketFront :fields="fields" />
          <TicketBack :story="fields.story" />
        </div>
      </label>
      <TicketToast />
    </div>

    <div class="et-fold-spacer"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { TicketFields } from '../runtime/types';
import TicketBack from './TicketBack.vue';
import TicketFront from './TicketFront.vue';
import TicketStamp from './TicketStamp.vue';
import TicketStub from './TicketStub.vue';
import TicketToast from './TicketToast.vue';

const props = defineProps<{
  fields: TicketFields;
}>();

const rootElement = ref<HTMLElement | null>(null);
const idSuffix = computed(() => props.fields.title || 'ticket');
const foldId = computed(() => `et-fold-${idSuffix.value}`);
const flipId = computed(() => `et-flip-${idSuffix.value}`);

defineExpose({ rootElement });
</script>
