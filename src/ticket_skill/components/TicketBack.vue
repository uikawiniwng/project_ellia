<template>
  <div class="et-face et-back">
    <div class="et-notebook-lines"></div>
    <div class="et-french-title-back-v9">Tu, was du willst</div>
    <div class="et-handwriting-v9">{{ story }}</div>
    <div class="et-signature-v9">— Ellia</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  story: string;
}>();
</script>
