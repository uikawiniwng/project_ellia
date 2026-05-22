<script setup lang="ts">
import { fontOptions, typewriterSpeedOptions } from '../constants';
import type { DialogBeautyUiSettings, FontMode, TypewriterSpeed } from '../types';

defineProps<{
  uiSettings: DialogBeautyUiSettings;
}>();

const emit = defineEmits<{
  (event: 'set-font-mode', mode: FontMode): void;
  (event: 'set-animation-enabled', enabled: boolean): void;
  (event: 'set-typewriter-speed', speed: TypewriterSpeed): void;
}>();
</script>

<template>
  <section class="ellia-v2-settings-section">
    <div class="ellia-v2-settings-title">字体</div>
    <div class="ellia-v2-settings-options">
      <button
        v-for="option in fontOptions"
        :key="option.value"
        type="button"
        class="ellia-v2-settings-option"
        :class="{ 'is-active': uiSettings.fontMode === option.value }"
        @click="emit('set-font-mode', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </section>

  <section class="ellia-v2-settings-section">
    <div class="ellia-v2-settings-title">环境动画</div>
    <div class="ellia-v2-settings-options">
      <button
        type="button"
        class="ellia-v2-settings-option"
        :class="{ 'is-active': uiSettings.animationEnabled }"
        @click="emit('set-animation-enabled', true)"
      >
        On
      </button>
      <button
        type="button"
        class="ellia-v2-settings-option"
        :class="{ 'is-active': !uiSettings.animationEnabled }"
        @click="emit('set-animation-enabled', false)"
      >
        Off
      </button>
    </div>
  </section>

  <section class="ellia-v2-settings-section">
    <div class="ellia-v2-settings-title">打字速度</div>
    <div class="ellia-v2-settings-options">
      <button
        v-for="option in typewriterSpeedOptions"
        :key="option.value"
        type="button"
        class="ellia-v2-settings-option"
        :class="{ 'is-active': uiSettings.typewriterSpeed === option.value }"
        @click="emit('set-typewriter-speed', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </section>
</template>
