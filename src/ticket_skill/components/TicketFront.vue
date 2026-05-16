<template>
  <div class="et-face et-front" :style="{ '--theme': fields.color }">
    <div class="et-french-watermark-v9">Die unendliche Geschichte</div>
    <div class="et-bg-guilloche"></div>
    <div class="et-corner c-tl"></div>
    <div class="et-corner c-tr"></div>
    <div class="et-corner c-bl"></div>
    <div class="et-corner c-br"></div>

    <div class="et-journey-header">
      <div class="et-loc-box from">
        <span class="et-sub-label">DEPARTURE / 出发地</span>
        <span class="et-loc-val">{{ fields.place }}</span>
      </div>
      <div class="et-arrow-connector">
        <div class="et-line"></div>
        <div class="et-dot"></div>
        <div class="et-line"></div>
      </div>
      <div class="et-loc-box to">
        <span class="et-sub-label">DESTINATION / 抵达</span>
        <span class="et-loc-val title">{{ fields.title }}</span>
      </div>
    </div>

    <div class="et-content-grid">
      <div class="et-col-macro">
        <div class="et-sect-head">ATMOSPHERE</div>
        <p class="et-text-macro">{{ fields.macro }}</p>
      </div>
      <div class="et-col-micro">
        <div class="et-stamp-frame">
          <div class="et-sect-head">SPECTACLE · 奇观</div>
          <p class="et-text-micro">{{ fields.micro }}</p>
          <div class="et-stamp-mark">OBSERVED</div>
        </div>
      </div>
    </div>

    <div class="et-strip-bottom">ELLIA'S FATE LINE · PASSENGER: &lt;user&gt; · CLASS: DREAMER</div>
  </div>
</template>

<script setup lang="ts">
import type { TicketFields } from '../runtime/types';

defineProps<{
  fields: TicketFields;
}>();
</script>
