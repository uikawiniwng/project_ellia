<template>
  <div class="et-stub">
    <div class="et-stub-inner">
      <div class="et-eye-gold">
        <svg
          viewBox="0 0 100 100"
          style="width:100%;height:100%;filter:drop-shadow(0 0 2px rgba(212,175,55,0.6));"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="42" fill="none" stroke="#c5a059" stroke-width="5" />
          <path
            d="M15 35 L90 20 M50 5 L35 90 M50 5 L65 90 M90 20 L20 80 M15 35 L80 85 M30 55 L25 70"
            fill="none"
            stroke="#c5a059"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="et-stub-text">
        <span class="et-v-text">{{ date }}</span>
        <span class="et-v-text">NO.617</span>
      </div>
    </div>
    <div class="et-rip-edge"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  date: string;
}>();
</script>
