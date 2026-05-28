<template>
  <div class="ellia-v2-settings-host">
    <div class="ellia-v2-settings-modal" :class="{ 'is-expanded': currentView === 'detail' }">
      <div class="ellia-v2-settings-modal-topbar">
        <div class="ellia-v2-settings-heading">
          <span class="ellia-v2-settings-title-main">艾莉亚整理出的旅途索引</span>
          <span class="ellia-v2-settings-title-sub">轻触其一，让我替你把命运翻到那一页</span>
        </div>
        <button class="ellia-v2-settings-close" type="button" @click="emit('close')">✕</button>
      </div>

      <section v-if="currentView === 'home'" class="ellia-v2-settings-section ellia-v2-settings-section--tickets">
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
        <DialogBeautySettingsSkill1Shell
          v-if="activeSection === 'skill1'"
          :story-settings="storySettings"
          @back="currentView = 'home'"
          @set-skill="forwardSetSkill"
          @quick-reply="emit('quick-reply', $event)"
        />

        <DialogBeautySettingsSkill2Shell
          v-else-if="activeSection === 'skill2'"
          :story-settings="storySettings"
          @back="currentView = 'home'"
          @set-skill="forwardSetSkill"
          @quick-reply="emit('quick-reply', $event)"
        />

        <DialogBeautySettingsWorldShell
          v-else-if="activeSection === 'world'"
          :story-settings="storySettings"
          :is-story-style-diy-open="isStoryStyleDiyOpen"
          :story-style-diy-draft="storyStyleDiyDraft"
          :story-style-diy-status="storyStyleDiyStatus"
          @back="currentView = 'home'"
          @set-form-type="emit('set-form-type', $event)"
          @set-skill="forwardSetSkill"
          @set-story-style="emit('set-story-style', $event)"
          @open-story-style-diy="emit('open-story-style-diy')"
          @close-story-style-diy="emit('close-story-style-diy')"
          @request-story-style-suggestion="emit('request-story-style-suggestion')"
          @save-story-style-diy="emit('save-story-style-diy')"
          @update:story-style-diy-draft="emit('update:story-style-diy-draft', $event)"
        />

        <DialogBeautySettingsBeautyShell
          v-else-if="activeSection === 'beauty'"
          :ui-settings="uiSettings"
          @back="currentView = 'home'"
          @set-font-mode="emit('set-font-mode', $event)"
          @set-animation-enabled="emit('set-animation-enabled', $event)"
          @set-typewriter-speed="emit('set-typewriter-speed', $event)"
          @set-avatar-mode="emit('set-avatar-mode', $event)"
        />

        <section v-else class="ellia-v2-ticket-shell" :class="`theme-${activeSection}`">
          <div class="ellia-v2-ticket-shell-head">
            <button type="button" class="ellia-v2-back-button" @click="currentView = 'home'">← 返回索引</button>

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

            <div class="ellia-v2-ticket-page-switch">
              <button
                type="button"
                class="ellia-v2-ticket-nav-button"
                :class="{ 'is-active': activeTab === 'settings' }"
                @click="activeTab = 'settings'"
              >
                设置页
              </button>
              <button
                type="button"
                class="ellia-v2-ticket-nav-button"
                :class="{ 'is-active': activeTab === 'detail' }"
                @click="activeTab = 'detail'"
              >
                介绍页
              </button>
            </div>
          </div>

          <div v-show="activeTab === 'settings'" class="ellia-v2-ticket-page ellia-v2-ticket-page-settings">
            <div class="ellia-v2-settings-note">
              <div>字体 / 动画 / 打字速度：保存到全局变量</div>
              <div>型态 / 技能 / 故事风格：保存到聊天变量，供后续 EJS / 世界书读取</div>
            </div>
          </div>

          <div v-show="activeTab === 'detail'" class="ellia-v2-ticket-page ellia-v2-ticket-page-detail">
            <div class="ellia-v2-settings-note ellia-v2-settings-note-inline">
              <div>字体 / 动画 / 打字速度：保存到全局变量</div>
              <div>型态 / 技能 / 故事风格：保存到聊天变量，供后续 EJS / 世界书读取</div>
            </div>
          </div>
        </section>
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
import DialogBeautySettingsBeautyShell from './DialogBeautySettingsBeautyShell.vue';
import DialogBeautySettingsSkill1Shell from './DialogBeautySettingsSkill1Shell.vue';
import DialogBeautySettingsSkill2Shell from './DialogBeautySettingsSkill2Shell.vue';
import DialogBeautySettingsWorldShell from './DialogBeautySettingsWorldShell.vue';
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
  (event: 'set-avatar-mode', enabled: boolean): void;
  (event: 'quick-reply', text: string): void;
}>();

const currentView = ref<'home' | 'detail'>('home');
const activeTab = ref<'settings' | 'detail'>('settings');

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
      return `当前型态为 ${getFormLabel(props.storySettings.formType)}；技能3当前为 ${getSkillLabel('skill3', props.storySettings.skill3)}；故事风格当前为 ${getStoryStyleLabel(props.storySettings.skill4, props.storySettings.skill4Custom)}。`;
    case 'beauty':
      return `当前字体为 ${getFontLabel(props.uiSettings.fontMode)}；环境动画${props.uiSettings.animationEnabled ? '开启' : '关闭'}；打字速度为 ${getTypewriterSpeedLabel(props.uiSettings.typewriterSpeed)}。`;
    default:
      return '';
  }
});

function getSkillLabel(skillKey: StorySkillKey, mode: SkillMode): string {
  return skillOptionGroups[skillKey].find(option => option.value === mode)?.label ?? mode;
}

function getFormLabel(mode: FormType): string {
  return formTypeOptions.find(option => option.value === mode)?.label ?? mode;
}

function getStoryStyleLabel(mode: StoryStyleMode, customDraft: string): string {
  if (mode === 'CUSTOM') {
    return customDraft ? `自定义：${customDraft}` : '自定义 / Rote Blume';
  }
  if (mode === 'WORLD') {
    return '世界本身决定';
  }
  return blueStoryStyleOptions.find(option => option.value === mode)?.label ?? mode;
}

function getFontLabel(mode: FontMode): string {
  return fontOptions.find(option => option.value === mode)?.label ?? mode;
}

function getTypewriterSpeedLabel(speed: TypewriterSpeed): string {
  return typewriterSpeedOptions.find(option => option.value === speed)?.label ?? speed;
}

function openSection(section: SettingsSectionKey) {
  currentView.value = 'detail';
  activeTab.value = 'settings';
  emit('select-section', section);
}

function forwardSetSkill(skillKey: StorySkillKey, mode: SkillMode) {
  emit('set-skill', skillKey, mode);
}
</script>

<style lang="scss">
.ellia-v2-settings-host {
  position: relative;
  z-index: 7;
  padding: 0 10px 14px;
}

.ellia-v2-settings-modal {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  max-width: 1220px;
  margin: 0 auto;
  padding: 1.05rem 1rem 1.2rem;
  border: 1px solid rgba(155, 89, 182, 0.18);
  border-radius: 4px;
  background: radial-gradient(circle at 50% 0%, rgba(43, 19, 56, 0.42) 0%, rgba(10, 3, 16, 0.96) 100%);
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.9),
    inset 0 0 60px rgba(202, 164, 93, 0.04);
  overflow: hidden;
  backdrop-filter: blur(12px);
}

.ellia-v2-settings-modal::before,
.ellia-v2-settings-modal::after {
  content: '';
  position: absolute;
  pointer-events: none;
}

.ellia-v2-settings-modal::before {
  inset: 14px;
  z-index: 1;
  border: 1px solid rgba(202, 164, 93, 0.2);
}

.ellia-v2-settings-modal::after {
  inset: 14px;
  z-index: 2;
  background:
    radial-gradient(circle at left top, #caa45d 0 2px, transparent 3px),
    radial-gradient(circle at right top, #caa45d 0 2px, transparent 3px),
    radial-gradient(circle at left bottom, #caa45d 0 2px, transparent 3px),
    radial-gradient(circle at right bottom, #caa45d 0 2px, transparent 3px);
  background-repeat: no-repeat;
}

.ellia-v2-settings-modal.is-expanded {
  background: radial-gradient(circle at 50% 0%, rgba(43, 19, 56, 0.42) 0%, rgba(10, 3, 16, 0.97) 100%);
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.9),
    inset 0 0 60px rgba(202, 164, 93, 0.04);
}

.ellia-v2-settings-modal-topbar {
  position: relative;
  z-index: 11;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 32px;
  margin-bottom: 0.35rem;
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
  margin-top: 0.2rem;
  color: rgba(212, 175, 115, 0.4);
  font-size: 0.6rem;
  letter-spacing: 20px;
  text-indent: 20px;
}

.ellia-v2-settings-close {
  position: absolute;
  top: 50%;
  right: 0.35rem;
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

.ellia-v2-settings-section--tickets {
  position: relative;
  z-index: 2;
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
    opacity 0.24s ease;
}

.ellia-v2-ticket-button:hover {
  z-index: 3;
  filter: drop-shadow(0 0 14px rgba(70, 184, 255, 0.44));
  transform: translateY(-0.9rem) scale(1.03);
}

.ellia-v2-ticket-shell {
  --ticket-accent: #b084cc;
  --ticket-accent-soft: rgba(155, 89, 182, 0.22);
  position: relative;
  display: flex;
  gap: 3rem;
  width: 100%;
  min-height: 540px;
  padding: 3.5rem 2.5rem 2.5rem;
  border: 1px solid rgba(155, 89, 182, 0.2);
  border-radius: 4px;
  background: rgba(15, 8, 22, 0.85);
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.9),
    inset 0 0 60px rgba(202, 164, 93, 0.03);
  backdrop-filter: blur(12px);
  overflow: hidden;
}

.ellia-v2-ticket-shell.theme-skill2 {
  --ticket-accent: #c489cc;
  --ticket-accent-soft: rgba(132, 97, 137, 0.2);
}

.ellia-v2-ticket-shell.theme-world {
  --ticket-accent: #d88196;
  --ticket-accent-soft: rgba(176, 93, 114, 0.22);
}

.ellia-v2-ticket-shell.theme-beauty {
  --ticket-accent: #cc9977;
  --ticket-accent-soft: rgba(135, 101, 77, 0.22);
}

.ellia-v2-ticket-shell::before,
.ellia-v2-ticket-shell::after {
  content: '';
  position: absolute;
  pointer-events: none;
}

.ellia-v2-ticket-shell::before {
  inset: 14px;
  z-index: 0;
  border: 1px solid rgba(202, 164, 93, 0.25);
}

.ellia-v2-ticket-shell::after {
  inset: 14px;
  z-index: 0;
  background:
    radial-gradient(circle at left top, #caa45d 0 2px, transparent 3px),
    radial-gradient(circle at right top, #caa45d 0 2px, transparent 3px),
    radial-gradient(circle at left bottom, #caa45d 0 2px, transparent 3px),
    radial-gradient(circle at right bottom, #caa45d 0 2px, transparent 3px);
  background-repeat: no-repeat;
}

.ellia-v2-ticket-shell-head {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  margin-top: 0.5rem;
  padding-right: 1.5rem;
}

.ellia-v2-ticket-shell-head::after {
  content: '';
  position: absolute;
  top: 5%;
  right: -1.5rem;
  bottom: 5%;
  width: 1px;
  background: linear-gradient(to bottom, transparent, rgba(202, 164, 93, 0.22), transparent);
}

.ellia-v2-ticket-page-switch {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: flex-start;
  margin-top: auto;
}

.ellia-v2-ticket-nav-button {
  min-height: 2rem;
  padding: 0.28rem 0.8rem;
  border: 1px solid rgba(224, 176, 255, 0.28);
  border-radius: 999px;
  background: rgba(69, 29, 85, 0.45);
  color: #f0dcfc;
  font-size: 0.68rem;
  cursor: pointer;
  transition:
    background 0.22s ease,
    border-color 0.22s ease,
    transform 0.22s ease;
}

.ellia-v2-ticket-nav-button:hover {
  transform: translateY(-1px);
  border-color: rgba(224, 176, 255, 0.52);
  background: rgba(92, 39, 112, 0.72);
}

.ellia-v2-ticket-nav-button.is-active {
  border-color: var(--ticket-accent);
  background: var(--ticket-accent-soft);
  color: #fff;
}

.ellia-v2-ticket-page {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-start;
  margin-top: 0.5rem;
  padding-left: 1.5rem;
  perspective: 1000px;
}

.ellia-v2-ticket-page-settings {
  display: grid;
  gap: 0.8rem;
  align-content: start;
}

.ellia-v2-settings-section {
  padding: 0.85rem 0.9rem;
  border: 1px solid rgba(224, 176, 255, 0.16);
  border-radius: 18px;
  background: rgba(45, 18, 55, 0.36);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.ellia-v2-settings-title {
  margin-bottom: 0.46rem;
  color: #e5c7ff;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.ellia-v2-settings-subtitle {
  margin: 0.46rem 0 0.25rem;
  color: rgba(233, 206, 247, 0.72);
  font-size: 0.65rem;
  letter-spacing: 0.08em;
}

.ellia-v2-settings-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.46rem;
}

.ellia-v2-settings-option {
  min-height: 2rem;
  padding: 0.34rem 0.78rem;
  border: 1px solid rgba(224, 176, 255, 0.24);
  border-radius: 999px;
  background: rgba(69, 29, 85, 0.56);
  color: #f0dcfc;
  font-size: 0.72rem;
  line-height: 1.35;
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
  border-color: var(--ticket-accent);
  background: var(--ticket-accent-soft);
  color: #fff;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.09);
}

.ellia-v2-story-style-diy {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.5rem;
}

.ellia-v2-story-style-input {
  width: 100%;
  min-height: 5.8rem;
  resize: vertical;
  padding: 0.55rem 0.65rem;
  border: 1px solid rgba(224, 176, 255, 0.24);
  border-radius: 14px;
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
  margin-top: 0.52rem;
  padding: 0.5rem 0.7rem;
  border-left: 2px solid var(--ticket-accent);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(238, 216, 255, 0.82);
  font-size: 0.66rem;
  line-height: 1.45;
}

.ellia-v2-ticket-page-detail {
  display: grid;
  gap: 0.95rem;
  align-content: start;
}

.ellia-v2-ticket-detail {
  width: 100%;
}

.ellia-v2-ticket-detail-hero {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.95rem;
  align-items: start;
  padding: 1rem;
  border: 1px solid rgba(224, 176, 255, 0.16);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(45, 18, 55, 0.4), rgba(19, 9, 28, 0.35));
}

.ellia-v2-ticket-detail-glyph {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 92px;
  height: 92px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.02));
  color: var(--ticket-accent);
  font-size: 3.1rem;
}

.ellia-v2-ticket-detail-copy {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
}

.ellia-v2-ticket-detail-title {
  font-size: 1.08rem;
  font-weight: 700;
}

.ellia-v2-ticket-detail-text {
  margin: 0;
  color: rgba(233, 206, 247, 0.8);
  font-size: 0.72rem;
  line-height: 1.7;
  white-space: pre-line;
}

.ellia-v2-settings-note {
  margin-top: 0.65rem;
  padding-top: 0.7rem;
  border-top: 1px solid rgba(224, 176, 255, 0.12);
  color: rgba(233, 206, 247, 0.74);
  font-size: 0.66rem;
  line-height: 1.55;
}

.ellia-v2-settings-note-inline {
  margin-top: 0;
  padding-top: 0;
  border-top: 0;
}

.ellia-v2-back-button {
  padding: 0;
  border: none;
  background: none;
  color: rgba(224, 176, 255, 0.55);
  font-size: 0.8rem;
  cursor: pointer;
  transition:
    color 0.25s ease,
    transform 0.25s ease;
}

.ellia-v2-back-button:hover {
  color: #caa45d;
  transform: translateX(-4px);
}

.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-settings-close,
.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-ticket-button,
.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-ticket-nav-button,
.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-settings-option,
.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-back-button {
  transition: none !important;
}

@media (max-width: 640px) {
  .ellia-v2-settings-host {
    padding: 0 8px 10px;
  }

  .ellia-v2-settings-modal {
    max-width: none;
    padding: 1rem 0.7rem;
  }

  .ellia-v2-settings-modal-topbar {
    margin-bottom: 0.75rem;
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

  .ellia-v2-ticket-shell {
    flex-direction: column;
    gap: 1.25rem;
    min-height: auto;
    padding: 3rem 1rem 1rem;
  }

  .ellia-v2-ticket-shell-head {
    padding-right: 0;
  }

  .ellia-v2-ticket-shell-head::after {
    display: none;
  }

  .ellia-v2-ticket-page {
    padding-left: 0;
  }

  .ellia-v2-ticket-page-switch {
    justify-content: flex-start;
    margin-top: 0;
  }

  .ellia-v2-ticket-detail-hero {
    grid-template-columns: 1fr;
  }

  .ellia-v2-ticket-detail-glyph {
    width: 84px;
    height: 84px;
  }
}

@media (max-width: 480px) {
  .ellia-v2-ticket-grid {
    grid-template-columns: 1fr;
  }
}
</style>
