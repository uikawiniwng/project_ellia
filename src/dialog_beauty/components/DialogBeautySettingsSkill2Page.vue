<script setup lang="ts">
import { quickReplyOptionGroups, skillOptionGroups } from '../constants';
import type { DialogBeautyStorySettings, SkillMode } from '../types';

defineProps<{
  storySettings: DialogBeautyStorySettings;
}>();

const emit = defineEmits<{
  (event: 'set-skill', skillKey: 'skill2', mode: SkillMode): void;
  (event: 'quick-reply', text: string): void;
}>();
</script>

<template>
  <section class="ellia-v2-settings-section is-quick-reply">
    <div class="ellia-v2-settings-title">快速回复</div>
    <div class="ellia-v2-settings-options">
      <button
        v-for="option in quickReplyOptionGroups.skill2"
        :key="option"
        type="button"
        class="ellia-v2-settings-option"
        @click="emit('quick-reply', option)"
      >
        {{ option }}
      </button>
    </div>
  </section>

  <section class="ellia-v2-settings-section">
    <div class="ellia-v2-settings-title">技能2</div>
    <div class="ellia-v2-settings-options">
      <button
        v-for="option in skillOptionGroups.skill2"
        :key="`skill2-${option.value}`"
        type="button"
        class="ellia-v2-settings-option"
        :class="{ 'is-active': storySettings.skill2 === option.value }"
        @click="emit('set-skill', 'skill2', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </section>
</template>
