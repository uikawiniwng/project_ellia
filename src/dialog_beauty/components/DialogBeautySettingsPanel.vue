<template>
  <div class="ellia-v2-settings-host">
    <div class="ellia-v2-settings-modal" :class="{ 'is-expanded': panelView === 'detail' }">
      <div class="ellia-v2-settings-modal-topbar">
        <div class="ellia-v2-settings-heading">
          <span class="ellia-v2-settings-title-main">艾莉亚整理出的旅途索引</span>
          <span class="ellia-v2-settings-title-sub">轻触其一，让我替你把命运翻到那一页</span>
        </div>
        <button class="ellia-v2-settings-close" type="button" @click="$emit('close')">✕</button>
      </div>

      <section v-if="panelView === 'home'" class="ellia-v2-settings-section ellia-v2-settings-section--tickets">
        <div class="ellia-v2-ticket-stage">
          <div class="ellia-v2-ticket-grid">
            <button
              v-for="section in settingsSections"
              :key="section.key"
              type="button"
              class="ellia-v2-ticket-button"
              @click="openSection(section.key)"
            >
              <DialogBeautyTicketCard
                :eyebrow="section.motif"
                :variant="section.key"
                :title="section.title"
                :subtitle="section.subtitle"
                :summary="section.intro"
              />
            </button>
          </div>
        </div>
      </section>

      <template v-else>
        <section class="ellia-v2-settings-section ellia-v2-settings-section--detail-hero">
          <button type="button" class="ellia-v2-back-button" @click="panelView = 'home'">← 返回索引</button>
          <div class="ellia-v2-ticket-detail">
            <div class="ellia-v2-ticket-detail-hero">
              <span class="ellia-v2-ticket-detail-glyph" aria-hidden="true">{{ currentSection.glyph }}</span>
              <div class="ellia-v2-ticket-detail-copy">
                <div class="ellia-v2-ticket-detail-title">{{ currentSection.title }}</div>
                <p class="ellia-v2-ticket-detail-text">{{ currentSection.intro }}</p>
                <p class="ellia-v2-ticket-detail-text">{{ currentStatus }}</p>
              </div>
            </div>
          </div>
        </section>

      <section v-if="activeSection === 'skill1'" class="ellia-v2-settings-section">
        <div class="ellia-v2-settings-title">技能1</div>
        <div class="ellia-v2-settings-options">
          <button
            v-for="option in skillOptionGroups.skill1"
            :key="`skill1-${option.value}`"
            type="button"
            class="ellia-v2-settings-option"
            :class="{ 'is-active': storySettings.skill1 === option.value }"
            @click="$emit('set-skill', 'skill1', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </section>

      <section v-if="activeSection === 'skill2'" class="ellia-v2-settings-section">
        <div class="ellia-v2-settings-title">技能2</div>
        <div class="ellia-v2-settings-options">
          <button
            v-for="option in skillOptionGroups.skill2"
            :key="`skill2-${option.value}`"
            type="button"
            class="ellia-v2-settings-option"
            :class="{ 'is-active': storySettings.skill2 === option.value }"
            @click="$emit('set-skill', 'skill2', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </section>

      <template v-if="activeSection === 'world'">
        <section class="ellia-v2-settings-section">
          <div class="ellia-v2-settings-title">型态</div>
          <div class="ellia-v2-settings-options">
            <button
              v-for="option in formTypeOptions"
              :key="option.value"
              type="button"
              class="ellia-v2-settings-option"
              :class="{ 'is-active': storySettings.formType === option.value }"
              @click="$emit('set-form-type', option.value)"
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
              @click="$emit('set-skill', 'skill3', option.value)"
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
              @click="$emit('set-story-style', 'WORLD')"
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
              @click="$emit('set-story-style', option.value)"
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
              @click="$emit('open-story-style-diy')"
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
              @input="$emit('update:story-style-diy-draft', ($event.target as HTMLTextAreaElement).value)"
            ></textarea>
            <div class="ellia-v2-settings-options">
              <button type="button" class="ellia-v2-settings-option" @click="$emit('save-story-style-diy')">传送</button>
              <button type="button" class="ellia-v2-settings-option" @click="$emit('request-story-style-suggestion')">
                帮我想/优化！
              </button>
              <button type="button" class="ellia-v2-settings-option" @click="$emit('close-story-style-diy')">取消</button>
            </div>
            <div v-if="storyStyleDiyStatus" class="ellia-v2-settings-status">{{ storyStyleDiyStatus }}</div>
          </div>
        </section>
      </template>

      <template v-if="activeSection === 'beauty'">
        <section class="ellia-v2-settings-section">
          <div class="ellia-v2-settings-title">字体</div>
          <div class="ellia-v2-settings-options">
            <button
              v-for="option in fontOptions"
              :key="option.value"
              type="button"
              class="ellia-v2-settings-option"
              :class="{ 'is-active': uiSettings.fontMode === option.value }"
              @click="$emit('set-font-mode', option.value)"
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
              @click="$emit('set-animation-enabled', true)"
            >
              On
            </button>
            <button
              type="button"
              class="ellia-v2-settings-option"
              :class="{ 'is-active': !uiSettings.animationEnabled }"
              @click="$emit('set-animation-enabled', false)"
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
              @click="$emit('set-typewriter-speed', option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </section>
      </template>

        <div class="ellia-v2-settings-note">
          <div>字体 / 动画 / 打字速度：保存到全局变量</div>
          <div>型态 / 技能 / 故事风格：保存到聊天变量，供后续 EJS / 世界书读取</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  blueStoryStyleOptions,
  fontOptions,
  formTypeOptions,
  settingsSections,
  skillOptionGroups,
  typewriterSpeedOptions,
} from '../constants';
import DialogBeautyTicketCard from './DialogBeautyTicketCard.vue';
import type {
  DialogBeautyStorySettings,
  DialogBeautyUiSettings,
  FontMode,
  FormType,
  SettingsSectionKey,
  SkillMode,
  StorySkillKey,
  StoryStyleMode,
  TypewriterSpeed,
} from '../types';

const props = defineProps<{
  uiSettings: DialogBeautyUiSettings;
  storySettings: DialogBeautyStorySettings;
  activeSection: SettingsSectionKey;
  isStoryStyleDiyOpen: boolean;
  storyStyleDiyDraft: string;
  storyStyleDiyStatus: string;
}>();

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'select-section', section: SettingsSectionKey): void;
  (event: 'set-font-mode', mode: FontMode): void;
  (event: 'set-form-type', mode: FormType): void;
  (event: 'set-skill', skillKey: StorySkillKey, mode: SkillMode): void;
  (event: 'set-story-style', mode: StoryStyleMode): void;
  (event: 'open-story-style-diy'): void;
  (event: 'close-story-style-diy'): void;
  (event: 'request-story-style-suggestion'): void;
  (event: 'save-story-style-diy'): void;
  (event: 'update:story-style-diy-draft', value: string): void;
  (event: 'set-animation-enabled', enabled: boolean): void;
  (event: 'set-typewriter-speed', speed: TypewriterSpeed): void;
}>();

const panelView = ref<'home' | 'detail'>('home');

const currentSection = computed(
  () => settingsSections.find(section => section.key === props.activeSection) ?? settingsSections[0],
);

const currentStatus = computed(() => {
  switch (props.activeSection) {
    case 'skill1':
      return `技能1当前为 ${getSkillLabel('skill1', props.storySettings.skill1)}。`;
    case 'skill2':
      return `技能2当前为 ${getSkillLabel('skill2', props.storySettings.skill2)}。`;
    case 'world':
      return `当前型态为 ${getFormTypeLabel(props.storySettings.formType)}；技能3当前为 ${getSkillLabel('skill3', props.storySettings.skill3)}；故事风格当前为 ${getStoryStyleLabel()}`;
    case 'beauty':
      return `当前字体为 ${getFontModeLabel(props.uiSettings.fontMode)}；环境动画${props.uiSettings.animationEnabled ? '开启' : '关闭'}；打字速度为 ${getTypewriterSpeedLabel(props.uiSettings.typewriterSpeed)}。`;
    default:
      return '';
  }
});

function getSkillLabel(skillKey: StorySkillKey, mode: SkillMode): string {
  return skillOptionGroups[skillKey].find(option => option.value === mode)?.label ?? mode;
}

function getFormTypeLabel(mode: FormType): string {
  return formTypeOptions.find(option => option.value === mode)?.label ?? mode;
}

function getFontModeLabel(mode: FontMode): string {
  return fontOptions.find(option => option.value === mode)?.label ?? mode;
}

function getTypewriterSpeedLabel(speed: TypewriterSpeed): string {
  return typewriterSpeedOptions.find(option => option.value === speed)?.label ?? speed;
}

function getStoryStyleLabel(): string {
  if (props.storySettings.skill4 === 'CUSTOM') {
    return props.storySettings.skill4Custom
      ? `自定义：${props.storySettings.skill4Custom}`
      : '自定义 / Rote Blume';
  }

  if (props.storySettings.skill4 === 'WORLD') {
    return '世界本身决定';
  }

  return blueStoryStyleOptions.find(option => option.value === props.storySettings.skill4)?.label ?? props.storySettings.skill4;
}

function openSection(section: SettingsSectionKey) {
  panelView.value = 'detail';
  emit('select-section', section);
}
</script>

<style scoped lang="scss">
.ellia-v2-settings-host {
  position: relative;
  z-index: 7;
  padding: 0 14px 14px;
}

.ellia-v2-settings-modal {
  position: relative;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  border: 1px solid rgba(212, 175, 115, 0.35);
  border-radius: 24px;
  background:
    radial-gradient(circle at 50% 0%, rgba(75, 30, 95, 0.8) 0%, rgba(30, 11, 43, 0.95) 45%, #0a0310 100%);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.6),
    0 0 0 5px rgba(222, 213, 181, 0.42),
    0 0 30px rgba(138, 43, 226, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.ellia-v2-settings-modal::before,
.ellia-v2-settings-modal::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ellia-v2-settings-modal::before {
  z-index: 5;
  background:
    radial-gradient(
      ellipse 70% 15% at 50% -5%,
      rgba(25, 5, 35, 1) 0%,
      rgba(40, 12, 55, 0.95) 55%,
      rgba(65, 25, 85, 0.8) 72%,
      rgba(212, 175, 115, 0.4) 75%,
      rgba(212, 175, 115, 0.05) 77%,
      transparent 82%
    ),
    radial-gradient(
      ellipse 60% 40% at 0% -5%,
      rgba(25, 5, 35, 1) 0%,
      rgba(40, 12, 55, 0.95) 55%,
      rgba(65, 25, 85, 0.8) 75%,
      rgba(212, 175, 115, 0.4) 77%,
      rgba(212, 175, 115, 0.05) 79%,
      transparent 82%
    ),
    radial-gradient(
      ellipse 60% 40% at 100% -5%,
      rgba(25, 5, 35, 1) 0%,
      rgba(40, 12, 55, 0.95) 55%,
      rgba(65, 25, 85, 0.8) 75%,
      rgba(212, 175, 115, 0.4) 77%,
      rgba(212, 175, 115, 0.05) 79%,
      transparent 82%
    ),
    linear-gradient(
      90deg,
      rgba(25, 5, 35, 1) 0%,
      rgba(40, 12, 55, 0.9) 3.5%,
      rgba(212, 175, 115, 0.3) 4.5%,
      transparent 6.5%
    ),
    linear-gradient(
      -90deg,
      rgba(25, 5, 35, 1) 0%,
      rgba(40, 12, 55, 0.9) 3.5%,
      rgba(212, 175, 115, 0.3) 4.5%,
      transparent 6.5%
    );
}

.ellia-v2-settings-modal::after {
  z-index: 10;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(8, 2, 15, 0.85) 0%, rgba(8, 2, 15, 0) 30%),
    linear-gradient(
      90deg,
      rgba(8, 2, 15, 0.9) 0%,
      rgba(8, 2, 15, 0) 15%,
      rgba(8, 2, 15, 0) 85%,
      rgba(8, 2, 15, 0.9) 100%
    );
}

.ellia-v2-settings-modal.is-expanded::before,
.ellia-v2-settings-modal.is-expanded::after {
  display: none;
}

.ellia-v2-settings-modal-topbar {
  position: relative;
  z-index: 11;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 32px;
  margin-bottom: 2rem;
}

.ellia-v2-settings-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.ellia-v2-settings-title-main {
  color: #f6ebff;
  font-size: 1.3rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.15em;
  text-shadow: 0 0 12px rgba(212, 175, 115, 0.5);
}

.ellia-v2-settings-title-sub {
  color: rgba(220, 190, 240, 0.7);
  font-size: 0.85rem;
  letter-spacing: 0.08em;
}

.ellia-v2-settings-heading::after {
  content: '✦';
  display: block;
  color: rgba(212, 175, 115, 0.4);
  font-size: 0.6rem;
  margin-top: 0.2rem;
  letter-spacing: 20px;
  text-indent: 20px;
}

.ellia-v2-settings-close {
  position: absolute;
  top: 50%;
  right: 0;
  z-index: 12;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border: 1px solid rgba(212, 175, 115, 0.3);
  border-radius: 50%;
  background: rgba(30, 11, 43, 0.8);
  color: #f6ebff;
  font-size: 0.9rem;
  line-height: 1;
  cursor: pointer;
  box-shadow: none;
  transform: translateY(-50%);
  transition:
    background 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease;
}

.ellia-v2-settings-close:hover {
  border-color: rgba(212, 175, 115, 0.8);
  background: rgba(75, 30, 95, 0.9);
  box-shadow: 0 0 15px rgba(212, 175, 115, 0.3);
}

.ellia-v2-settings-section + .ellia-v2-settings-section {
  margin-top: 0.7rem;
}

.ellia-v2-settings-section--tickets {
  position: relative;
  z-index: 2;
  margin-bottom: 0.35rem;
}

.ellia-v2-settings-section--detail-hero {
  margin-bottom: 0.2rem;
}

.ellia-v2-settings-title {
  margin-bottom: 0.35rem;
  color: #dfb5ff;
  font-size: 0.73rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ellia-v2-settings-subtitle {
  margin: 0.42rem 0 0.28rem;
  color: rgba(233, 206, 247, 0.72);
  font-size: 0.64rem;
  letter-spacing: 0.06em;
}

.ellia-v2-ticket-stage {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  gap: 10px;
  width: 100%;
}

.ellia-v2-ticket-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: end;
  gap: 1rem;
  width: 100%;
  max-width: 940px;
  margin: 0 auto;
  padding: 0.45rem 0 1.2rem;
}

.ellia-v2-ticket-button {
  position: relative;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  text-align: inherit;
  transition:
    transform 0.28s ease,
    filter 0.28s ease,
    z-index 0s linear;
}

.ellia-v2-ticket-button:hover,
.ellia-v2-ticket-button.is-active {
  z-index: 3;
  filter: drop-shadow(0 0 14px rgba(70, 184, 255, 0.44));
  transform: translateY(-0.9rem) scale(1.03);
}

.ellia-v2-ticket-detail {
  margin-top: 0.75rem;
  padding: 0.8rem 0.9rem;
  border: 1px solid rgba(224, 176, 255, 0.14);
  border-radius: 12px;
  background: rgba(31, 13, 41, 0.78);
}

.ellia-v2-back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  margin-bottom: 0.7rem;
  padding: 0.28rem 0.62rem;
  border: 1px solid rgba(224, 176, 255, 0.24);
  border-radius: 999px;
  background: rgba(58, 24, 73, 0.72);
  color: rgba(244, 221, 255, 0.88);
  font-size: 0.7rem;
  cursor: pointer;
}

.ellia-v2-ticket-detail-hero {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
}

.ellia-v2-ticket-detail-glyph {
  display: inline-flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(224, 176, 255, 0.22);
  border-radius: 999px;
  background: rgba(68, 28, 84, 0.72);
  font-size: 1rem;
}

.ellia-v2-ticket-detail-copy {
  min-width: 0;
}

.ellia-v2-ticket-detail-title {
  color: #f2dcff;
  font-size: 0.9rem;
  font-weight: 600;
}

.ellia-v2-ticket-detail-text {
  margin: 0.38rem 0 0;
  color: rgba(238, 216, 255, 0.78);
  font-size: 0.71rem;
  line-height: 1.55;
}

.ellia-v2-settings-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.ellia-v2-story-style-diy {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.5rem;
}

.ellia-v2-story-style-input {
  width: 100%;
  min-height: 5.2rem;
  resize: vertical;
  padding: 0.55rem 0.65rem;
  border: 1px solid rgba(224, 176, 255, 0.24);
  border-radius: 8px;
  background: rgba(25, 10, 35, 0.78);
  color: #f4e8ff;
  font: inherit;
  font-size: 0.74rem;
  line-height: 1.45;
  outline: none;
}

.ellia-v2-story-style-input:focus {
  border-color: rgba(224, 176, 255, 0.58);
  box-shadow: 0 0 0 2px rgba(155, 89, 182, 0.18);
}

.ellia-v2-settings-status {
  color: rgba(238, 216, 255, 0.78);
  font-size: 0.66rem;
  line-height: 1.45;
}

.ellia-v2-settings-option {
  min-height: 2rem;
  padding: 0.32rem 0.72rem;
  border: 1px solid rgba(224, 176, 255, 0.2);
  border-radius: 999px;
  background: rgba(69, 29, 85, 0.56);
  color: #f0dcfc;
  font-size: 0.74rem;
  line-height: 1.25;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.ellia-v2-settings-option:hover {
  transform: translateY(-1px);
  border-color: rgba(224, 176, 255, 0.42);
  background: rgba(92, 39, 112, 0.72);
}

.ellia-v2-settings-option.is-active {
  border-color: rgba(224, 176, 255, 0.78);
  background: linear-gradient(180deg, rgba(144, 74, 178, 0.92), rgba(93, 39, 115, 0.95));
  box-shadow: 0 0 14px rgba(155, 89, 182, 0.32);
}

.ellia-v2-settings-note {
  margin-top: 0.8rem;
  padding-top: 0.7rem;
  border-top: 1px solid rgba(224, 176, 255, 0.12);
  color: rgba(233, 206, 247, 0.74);
  font-size: 0.66rem;
  line-height: 1.55;
}

:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-settings-option),
:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-settings-close),
:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-ticket-button) {
  transition: none !important;
}

@media (max-width: 640px) {
  .ellia-v2-settings-host {
    padding: 0 8px 10px;
  }

  .ellia-v2-settings-modal {
    max-width: none;
    padding: 1.35rem 0.9rem 1rem;
  }

  .ellia-v2-settings-modal-topbar {
    margin-bottom: 1.25rem;
  }

  .ellia-v2-settings-title-main {
    font-size: 1.02rem;
    letter-spacing: 0.08em;
  }

  .ellia-v2-settings-title-sub {
    font-size: 0.75rem;
  }

  .ellia-v2-settings-close {
    right: 0.1rem;
  }

  .ellia-v2-ticket-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 0.25rem 0 0.8rem;
  }

  .ellia-v2-ticket-detail-hero {
    gap: 0.65rem;
  }
}

@media (max-width: 480px) {
  .ellia-v2-ticket-grid {
    grid-template-columns: 1fr;
  }
}
</style>
