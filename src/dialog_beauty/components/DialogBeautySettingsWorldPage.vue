<script setup lang="ts">
import { blueStoryStyleOptions, formTypeOptions, skillOptionGroups } from '../constants';
import type { DialogBeautyStorySettings, FormType, SkillMode, StoryStyleMode } from '../types';

defineProps<{
  storySettings: DialogBeautyStorySettings;
  isStoryStyleDiyOpen: boolean;
  storyStyleDiyDraft: string;
  storyStyleDiyStatus: string;
}>();

const emit = defineEmits<{
  (event: 'set-form-type', mode: FormType): void;
  (event: 'set-skill', skillKey: 'skill3', mode: SkillMode): void;
  (event: 'set-story-style', mode: StoryStyleMode): void;
  (event: 'open-story-style-diy'): void;
  (event: 'close-story-style-diy'): void;
  (event: 'request-story-style-suggestion'): void;
  (event: 'save-story-style-diy'): void;
  (event: 'update:story-style-diy-draft', value: string): void;
}>();
</script>

<template>
  <section class="ellia-v2-settings-section">
    <div class="ellia-v2-settings-title">型态</div>
    <div class="ellia-v2-settings-options">
      <button
        v-for="option in formTypeOptions"
        :key="option.value"
        type="button"
        class="ellia-v2-settings-option"
        :class="{ 'is-active': storySettings.formType === option.value }"
        @click="emit('set-form-type', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </section>

  <section class="ellia-v2-settings-section">
    <div class="ellia-v2-settings-title">技能3</div>
    <div class="ellia-v2-settings-options">
      <button
        v-for="option in skillOptionGroups.skill3"
        :key="`skill3-${option.value}`"
        type="button"
        class="ellia-v2-settings-option"
        :class="{ 'is-active': storySettings.skill3 === option.value }"
        @click="emit('set-skill', 'skill3', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </section>

  <section class="ellia-v2-settings-section">
    <div class="ellia-v2-settings-title">技能4 / 故事风格</div>
    <div class="ellia-v2-settings-subtitle">Responsive</div>
    <div class="ellia-v2-settings-options">
      <button
        type="button"
        class="ellia-v2-settings-option"
        :class="{ 'is-active': storySettings.skill4 === 'WORLD' }"
        @click="emit('set-story-style', 'WORLD')"
      >
        当前的故事风格由世界本身决定
      </button>
    </div>

    <div class="ellia-v2-settings-subtitle">Blaue Blume</div>
    <div class="ellia-v2-settings-options">
      <button
        v-for="option in blueStoryStyleOptions"
        :key="`story-style-${option.value}`"
        type="button"
        class="ellia-v2-settings-option"
        :class="{ 'is-active': storySettings.skill4 === option.value }"
        @click="emit('set-story-style', option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <div class="ellia-v2-settings-subtitle">Rote Blume</div>
    <div class="ellia-v2-settings-options">
      <button
        type="button"
        class="ellia-v2-settings-option"
        :class="{ 'is-active': isStoryStyleDiyOpen }"
        @click="emit('open-story-style-diy')"
      >
        自定义
      </button>
    </div>

    <div v-if="storyStyleDiyStatus && !isStoryStyleDiyOpen" class="ellia-v2-settings-status">
      {{ storyStyleDiyStatus }}
    </div>

    <div v-if="isStoryStyleDiyOpen" class="ellia-v2-story-style-diy">
      <textarea
        :value="storyStyleDiyDraft"
        class="ellia-v2-story-style-input"
        rows="3"
        placeholder="输入你想要的自定义故事风格"
        @input="emit('update:story-style-diy-draft', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
      <div class="ellia-v2-settings-options">
        <button type="button" class="ellia-v2-settings-option" @click="emit('save-story-style-diy')">传送</button>
        <button type="button" class="ellia-v2-settings-option" @click="emit('request-story-style-suggestion')">
          帮我想/优化！
        </button>
        <button type="button" class="ellia-v2-settings-option" @click="emit('close-story-style-diy')">取消</button>
      </div>
      <div v-if="storyStyleDiyStatus" class="ellia-v2-settings-status">
        {{ storyStyleDiyStatus }}
      </div>
    </div>
  </section>
</template>
