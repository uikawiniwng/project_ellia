<template>
  <div
    class="ellia-v2-root"
    :data-font-mode="uiSettings.fontMode"
    :data-animations-enabled="uiSettings.animationEnabled ? 'true' : 'false'"
  >
    <div
      v-for="card in cards"
      :key="card.id"
      :ref="element => setCardRef(card.id, element)"
      class="ellia-v2-container"
      :class="{
        'is-animating': card.isAnimating,
        'is-replay-ready': card.canReplay,
        'is-offscreen': !card.isVisible,
        'is-settings-open': isSettingsOpen(card.id),
      }"
    >
      <div class="ellia-v2-magic-circle-layer">
        <div class="magic-ring r1"></div>
        <div class="magic-ring r2"></div>
        <div class="magic-symbol"></div>
      </div>
      <div class="ellia-v2-star-dust"></div>

      <div class="ellia-v2-corner-controls">
        <button
          class="ellia-v2-control-button ellia-v2-settings-button"
          type="button"
          :aria-expanded="isSettingsOpen(card.id)"
          @click.stop="toggleSettings(card.id)"
        >
          ⚙
        </button>
        <button
          v-if="!card.hasPlayed && !card.isAnimating"
          class="ellia-v2-control-button ellia-v2-play-button"
          type="button"
          @click.stop="startCardFromControl(card.id)"
        >
          Play
        </button>
        <button
          v-else-if="card.canReplay && !card.isAnimating"
          class="ellia-v2-control-button ellia-v2-replay-button"
          type="button"
          @click.stop="replayCard(card.id)"
        >
          ↻
        </button>
      </div>

      <div
        class="ellia-v2-card-inner ellia-v2-trigger-surface"
        @mouseenter="requestPlay(card.id)"
        @click="activateCard(card.id)"
      >
        <div class="ellia-v2-header">
          <div class="ellia-v2-eye-box">
            <div class="v2-eye-frame"></div>
            <div class="v2-eye-ball"></div>
          </div>
          <div class="ellia-v2-title">
            <span class="v2-name-cn">{{ card.name }}</span>
            <span class="v2-name-en">Ellia</span>
          </div>
          <div class="ellia-v2-header-line"></div>
        </div>

        <div class="ellia-v2-debug-strip">
          <span v-for="badge in debugBadges" :key="badge.key" class="ellia-v2-debug-pill">
            {{ badge.label }}
          </span>
        </div>

        <div :ref="element => setContentRef(card.id, element)" class="ellia-v2-content text">
          <div v-for="(line, index) in card.lines" :key="`${card.id}-${line.type}-${index}`" class="ellia-v2-line">
            <span v-if="line.type === 'action'" class="ellia-v2-action">{{ line.text }}</span>
            <template v-else>{{ line.text }}</template>
          </div>
        </div>
      </div>

      <DialogBeautySettingsPanel
        v-if="isSettingsOpen(card.id)"
        :ui-settings="uiSettings"
        :story-settings="storySettings"
        :active-section="activeSettingsSection"
        :is-story-style-diy-open="isStoryStyleDiyOpen"
        :story-style-diy-draft="storyStyleDiyDraft"
        :story-style-diy-status="storyStyleDiyStatus"
        @close="closeSettingsPanel"
        @select-section="selectSettingsSection"
        @set-font-mode="setFontMode"
        @set-form-type="setFormType"
        @set-skill="setSkill"
        @set-story-style="setStoryStyle"
        @open-story-style-diy="openStoryStyleDiy"
        @close-story-style-diy="closeStoryStyleDiy"
        @request-story-style-suggestion="requestStoryStyleSuggestion"
        @save-story-style-diy="saveStoryStyleDiy"
        @update:story-style-diy-draft="storyStyleDiyDraft = $event"
        @set-animation-enabled="setAnimationEnabled"
        @set-typewriter-speed="setTypewriterSpeed"
        @quick-reply="handleQuickReply"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';
import type { ComponentPublicInstance } from 'vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { elliaFormLabels, SETTINGS_SYNC_EVENT } from './constants';
import DialogBeautySettingsPanel from './components/DialogBeautySettingsPanel.vue';
import {
  getDefaultStorySettings,
  getDefaultUiSettings,
  getSkillLabel,
  getStoryStyleLabel,
  normalizeCustomStoryStyle,
  readPersistedSettings,
  persistUiSettings,
  persistStorySettings,
  syncFormTypeToMessageVariables,
} from './settings';
import {
  buildStoryToneReminder,
  buildStoryToneRequest,
  insertIntoPromptInput,
  spendStoryToneFp,
} from './story-tone';
import { buildTypewriterTimeline, renderStaticText } from './typewriter';
import { getCurrentElliaBlockIndex, parseCurrentElliaBlock } from './parser';
import type {
  DialogBeautyStorySettings,
  DialogBeautyUiSettings,
  ElliaCard,
  FontMode,
  FormType,
  SettingsSectionKey,
  SkillMode,
  StorySkillKey,
  StoryStyleMode,
  TypewriterSpeed,
} from './types';

type ToastHostWindow = Window &
  typeof globalThis & {
    toastr?: {
      info?: (message: string) => void;
    };
  };

const cards = ref<ElliaCard[]>([]);
const uiSettings = ref<DialogBeautyUiSettings>(getDefaultUiSettings());
const storySettings = ref<DialogBeautyStorySettings>(getDefaultStorySettings());
const activeSettingsCardId = ref<string | null>(null);
const activeSettingsSection = ref<SettingsSectionKey>('skill1');
const settingsReady = ref(false);
const isStoryStyleDiyOpen = ref(false);
const storyStyleDiyDraft = ref('');
const storyStyleDiyStatus = ref('');
const contentRefs = new Map<string, HTMLElement>();
const cardRefs = new Map<string, HTMLElement>();
const timelineMap = new Map<string, gsap.core.Timeline>();
let intersectionObserver: IntersectionObserver | null = null;

const debugBadges = computed(() => [
  { key: 'type', label: elliaFormLabels[storySettings.value.formType] },
  { key: 'skill1', label: getSkillLabel('skill1', storySettings.value.skill1) },
  { key: 'skill2', label: getSkillLabel('skill2', storySettings.value.skill2) },
  { key: 'skill3', label: getSkillLabel('skill3', storySettings.value.skill3) },
  { key: 'skill4', label: getStoryStyleLabel(storySettings.value.skill4, storySettings.value.skill4Custom) },
]);

function handleExternalSettingsSync(payload?: { source?: string; scope?: string; key?: string }) {
  console.info('收到外部 Dialog Beauty 设置同步事件', payload ?? {});
  const persisted = readPersistedSettings();
  uiSettings.value = persisted.uiSettings;
  storySettings.value = persisted.storySettings;
  if (persisted.messageFormType) {
    storySettings.value.formType = persisted.messageFormType;
  }

  if (uiSettings.value.typewriterSpeed === 'disable') {
    cards.value.forEach(card => {
      if (card.isAnimating) {
        stopAnimation(card.id, true);
      }
    });
  }
}

function setContentRef(cardId: string, element: Element | ComponentPublicInstance | null) {
  if (element instanceof HTMLElement) {
    contentRefs.set(cardId, element);
    return;
  }

  contentRefs.delete(cardId);
}

function setCardRef(cardId: string, element: Element | ComponentPublicInstance | null) {
  if (element instanceof HTMLElement) {
    cardRefs.set(cardId, element);
    return;
  }

  cardRefs.delete(cardId);
}

function getCard(cardId: string): ElliaCard | undefined {
  return cards.value.find(card => card.id === cardId);
}

function isSettingsOpen(cardId: string): boolean {
  return activeSettingsCardId.value === cardId;
}

function toggleSettings(cardId: string) {
  if (activeSettingsCardId.value === cardId) {
    closeSettingsPanel();
    return;
  }

  activeSettingsCardId.value = cardId;
}

function closeSettingsPanel() {
  activeSettingsCardId.value = null;
}

function selectSettingsSection(section: SettingsSectionKey) {
  activeSettingsSection.value = section;
}

function setFontMode(mode: FontMode) {
  uiSettings.value.fontMode = mode;
}

function setFormType(mode: FormType) {
  storySettings.value.formType = mode;
  syncFormTypeToMessageVariables(mode);
}

function setSkill(skillKey: StorySkillKey, mode: SkillMode) {
  storySettings.value[skillKey] = mode;
}

function setStoryStyle(mode: StoryStyleMode) {
  storySettings.value.skill4 = mode;
  storySettings.value.skill4Request = false;
  isStoryStyleDiyOpen.value = false;
  storyStyleDiyStatus.value = '';
}

function openStoryStyleDiy() {
  isStoryStyleDiyOpen.value = true;
  storyStyleDiyDraft.value = storySettings.value.skill4Custom;
  storyStyleDiyStatus.value = '';
}

function closeStoryStyleDiy() {
  isStoryStyleDiyOpen.value = false;
  storyStyleDiyStatus.value = '';
}

function requestStoryStyleSuggestion() {
  const normalizedStoryTone = normalizeCustomStoryStyle(storyStyleDiyDraft.value);
  if (!normalizedStoryTone) {
    storyStyleDiyStatus.value = '请先输入一个大概方向。';
    return;
  }

  storySettings.value.skill4Request = false;
  const inserted = insertIntoPromptInput(buildStoryToneRequest(normalizedStoryTone));
  storyStyleDiyStatus.value = inserted
    ? '已写入输入框，发送前可以继续编辑。'
    : '未找到输入框，请手动复制 Request 标记。';
}

function saveStoryStyleDiy() {
  const normalizedStoryTone = normalizeCustomStoryStyle(storyStyleDiyDraft.value);
  if (!normalizedStoryTone) {
    storyStyleDiyStatus.value = '请输入故事风格。';
    return;
  }

  const spendResult = spendStoryToneFp();
  if (!spendResult.ok) {
    storyStyleDiyStatus.value = spendResult.reason ?? 'FP 不足，无法保存。';
    return;
  }

  storySettings.value.skill4 = 'CUSTOM';
  storySettings.value.skill4Custom = normalizedStoryTone;
  storySettings.value.skill4Request = false;

  const inserted = insertIntoPromptInput(buildStoryToneReminder(normalizedStoryTone));
  storyStyleDiyStatus.value = inserted
    ? `已保存，剩余 ${spendResult.remaining} FP；已写入输入框。`
    : `已保存，剩余 ${spendResult.remaining} FP；但未找到输入框。`;
}

function setAnimationEnabled(enabled: boolean) {
  uiSettings.value.animationEnabled = enabled;
}

function setTypewriterSpeed(speed: TypewriterSpeed) {
  uiSettings.value.typewriterSpeed = speed;

  if (speed === 'disable') {
    cards.value.forEach(card => {
      if (card.isAnimating) {
        stopAnimation(card.id, true);
      }
    });
  }
}

function handleQuickReply(text: string) {
  const inserted = insertIntoPromptInput(text);
  (window.parent as ToastHostWindow).toastr?.info?.(inserted ? `已写入输入框：${text}` : '未找到输入框');
}

function startCardFromControl(cardId: string) {
  closeSettingsPanel();
  startAnimation(cardId, false);
}

function killTimeline(cardId: string) {
  const timeline = timelineMap.get(cardId);
  if (!timeline) {
    return;
  }

  timeline.kill();
  timelineMap.delete(cardId);
}

function stopAnimation(cardId: string, showReplayHint: boolean) {
  const card = getCard(cardId);
  const contentElement = contentRefs.get(cardId);
  if (!card) {
    return;
  }

  killTimeline(cardId);
  if (contentElement) {
    renderStaticText(contentElement, card);
  }
  card.isAnimating = false;
  card.canReplay = showReplayHint;
}

function startAnimation(cardId: string, forceReplay = false) {
  const card = getCard(cardId);
  const contentElement = contentRefs.get(cardId);
  if (!card || !contentElement || !card.isVisible) {
    return;
  }

  if (card.isAnimating) {
    return;
  }

  if (!forceReplay && card.hasPlayed) {
    return;
  }

  killTimeline(cardId);

  if (uiSettings.value.typewriterSpeed === 'disable') {
    renderStaticText(contentElement, card);
    card.isAnimating = false;
    card.hasPlayed = true;
    card.canReplay = true;
    return;
  }

  const timeline = buildTypewriterTimeline(
    card,
    contentElement,
    uiSettings.value.typewriterSpeed === 'normal' ? 'normal' : 'fast',
    () => {
      card.isAnimating = false;
      card.canReplay = true;
      timelineMap.delete(cardId);
      renderStaticText(contentElement, card);
    },
  );
  if (!timeline) {
    return;
  }

  card.isAnimating = true;
  card.hasPlayed = true;
  card.canReplay = false;

  timelineMap.set(cardId, timeline);
  timeline.play(0);
}

function requestPlay(cardId: string) {
  if (isSettingsOpen(cardId)) {
    return;
  }

  startAnimation(cardId, false);
}

function activateCard(cardId: string) {
  const card = getCard(cardId);
  if (!card) {
    return;
  }

  if (isSettingsOpen(cardId)) {
    return;
  }

  startAnimation(cardId, card.hasPlayed);
}

function replayCard(cardId: string) {
  closeSettingsPanel();
  startAnimation(cardId, true);
}

function setupIntersectionObserver() {
  intersectionObserver?.disconnect();
  intersectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const element = entry.target as HTMLElement;
        const cardId = element.dataset.cardId;
        if (!cardId) {
          return;
        }

        const card = getCard(cardId);
        if (!card) {
          return;
        }

        card.isVisible = entry.isIntersecting;
        if (!entry.isIntersecting) {
          stopAnimation(cardId, card.hasPlayed);
        }
      });
    },
    {
      threshold: 0.08,
    },
  );

  cardRefs.forEach((element, cardId) => {
    element.dataset.cardId = cardId;
    intersectionObserver?.observe(element);
  });
}

async function init() {
  const persisted = readPersistedSettings();
  uiSettings.value = persisted.uiSettings;
  storySettings.value = persisted.storySettings;
  if (persisted.messageFormType) {
    storySettings.value.formType = persisted.messageFormType;
  }

  const message = getChatMessages(getCurrentMessageId())[0]?.message ?? '';
  const blockIndex = getCurrentElliaBlockIndex(message);
  const card = parseCurrentElliaBlock(message, blockIndex);
  cards.value = card ? [card] : [];

  if (!cards.value.length) {
    console.warn('未在当前消息中找到符合条件的 <ellia> 标签');
    settingsReady.value = true;
    return;
  }

  await nextTick();
  cards.value.forEach(cardItem => {
    const contentElement = contentRefs.get(cardItem.id);
    if (contentElement) {
      renderStaticText(contentElement, cardItem);
    }
  });
  setupIntersectionObserver();
  settingsReady.value = true;
}

watch(
  uiSettings,
  () => {
    if (!settingsReady.value) {
      return;
    }

    persistUiSettings(uiSettings.value);
  },
  { deep: true },
);

watch(
  storySettings,
  () => {
    if (!settingsReady.value) {
      return;
    }

    persistStorySettings(storySettings.value);
  },
  { deep: true },
);

onMounted(() => {
  eventOn(SETTINGS_SYNC_EVENT, handleExternalSettingsSync);
  errorCatched(init)();
});

onBeforeUnmount(() => {
  intersectionObserver?.disconnect();
  intersectionObserver = null;
  timelineMap.forEach(timeline => timeline.kill());
  timelineMap.clear();
  contentRefs.clear();
  cardRefs.clear();
});
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Noto+Serif+SC:wght@400;600&display=swap');
@import url('https://fontsapi.zeoseven.com/633/main/result.css');
@import url('https://fontsapi.zeoseven.com/813/main/result.css');
@import url('https://fontsapi.zeoseven.com/2/main/result.css');
@import url('https://fontsapi.zeoseven.com/281/main/result.css');
@import url('https://fontsapi.zeoseven.com/116/main/result.css');

.ellia-v2-root {
  --ellia-body-font: 'Sthginkra', 'Noto Serif SC', serif;
  clear: both;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ellia-v2-root[data-font-mode='A'] {
  --ellia-body-font: 'Sthginkra', 'Noto Serif SC', serif;
}

.ellia-v2-root[data-font-mode='B'] {
  --ellia-body-font: 'Yomeng Script', 'Noto Serif SC', serif;
}

.ellia-v2-root[data-font-mode='C'] {
  --ellia-body-font: 'LXGW ZhenKai GB', 'Noto Serif SC', serif;
}

.ellia-v2-root[data-font-mode='D'] {
  --ellia-body-font: 'Xiaolai', 'Noto Serif SC', serif;
}

.ellia-v2-root[data-font-mode='E'] {
  --ellia-body-font: 'Kingnammm Maiyuan 2', 'Noto Serif SC', serif;
}

.ellia-v2-container {
  --e-main: #9b59b6;
  --e-deep: #2e1035;
  --e-accent: #e0b0ff;
  --e-glow: rgba(155, 89, 182, 0.6);
  --e-star: #ffffff;
  position: relative;
  margin: 0 5px;
  padding: 3px;
  background: linear-gradient(145deg, rgba(20, 10, 30, 0.95), rgba(40, 20, 60, 0.9));
  border: 1px solid rgba(155, 89, 182, 0.3);
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  font-family: var(--ellia-body-font);
  font-weight: normal;
  overflow: visible;
  transition:
    border-color 0.35s ease,
    box-shadow 0.35s ease,
    opacity 0.35s ease;
  isolation: isolate;
  contain: paint;
  clear: both;
}

.ellia-v2-container:hover,
.ellia-v2-container.is-animating,
.ellia-v2-container.is-settings-open {
  border-color: var(--e-accent);
  box-shadow:
    0 0 25px var(--e-glow),
    inset 0 0 10px rgba(155, 89, 182, 0.2);
}

.ellia-v2-container.is-offscreen {
  opacity: 0.92;
}

.ellia-v2-magic-circle-layer {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  transform: translate(-50%, -50%) scale(0.8);
  opacity: 0.1;
  pointer-events: none;
  transition:
    transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity;
  z-index: -1;
}

.ellia-v2-container:hover .ellia-v2-magic-circle-layer,
.ellia-v2-container.is-animating .ellia-v2-magic-circle-layer,
.ellia-v2-container.is-settings-open .ellia-v2-magic-circle-layer {
  opacity: 0.4;
  transform: translate(-50%, -50%) scale(1.2) rotate(180deg);
}

.magic-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  border: 1px solid var(--e-accent);
  transform: translate(-50%, -50%);
}

.r1 {
  width: 100%;
  height: 100%;
  border-style: dashed;
  animation: v2-spin 60s linear infinite;
  animation-play-state: paused;
}

.r2 {
  width: 70%;
  height: 70%;
  border: 1px solid var(--e-main);
  animation: v2-spin 40s linear infinite reverse;
  animation-play-state: paused;
}

.magic-symbol {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50%;
  height: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(transparent 40%, var(--e-main) 100%);
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  opacity: 0.5;
}

.ellia-v2-star-dust {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1.5px 1.5px at 10px 10px, var(--e-star), rgba(0, 0, 0, 0)),
    radial-gradient(1.5px 1.5px at 50px 80px, var(--e-star), rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 120px 40px, var(--e-star), rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 200px 150px, var(--e-star), rgba(0, 0, 0, 0));
  background-repeat: repeat;
  background-size: 250px 250px;
  opacity: 0.4;
  z-index: -1;
  animation: v2-twinkle 6s infinite alternate;
  animation-play-state: paused;
}

.ellia-v2-card-inner {
  position: relative;
  padding: 44px 18px 14px;
  z-index: 2;
  border-radius: 4px;
}

.ellia-v2-trigger-surface {
  cursor: pointer;
  touch-action: manipulation;
}

.ellia-v2-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.35rem;
}

.ellia-v2-eye-box {
  width: 24px;
  height: 16px;
  position: relative;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.v2-eye-frame {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 1.5px solid var(--e-accent);
  border-radius: 50% 50% 40% 40%;
  border-top-width: 2px;
  transform: rotate(-5deg);
  box-shadow: 0 0 5px var(--e-main);
  opacity: 0.9;
}

.v2-eye-ball {
  width: 5px;
  height: 8px;
  background: var(--e-accent);
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  animation: v2-blink-look 5s infinite;
  animation-play-state: paused;
}

.ellia-v2-container:hover .r1,
.ellia-v2-container:hover .r2,
.ellia-v2-container:hover .ellia-v2-star-dust,
.ellia-v2-container:hover .v2-eye-ball,
.ellia-v2-container.is-animating .r1,
.ellia-v2-container.is-animating .r2,
.ellia-v2-container.is-animating .ellia-v2-star-dust,
.ellia-v2-container.is-animating .v2-eye-ball,
.ellia-v2-container.is-settings-open .r1,
.ellia-v2-container.is-settings-open .r2,
.ellia-v2-container.is-settings-open .ellia-v2-star-dust,
.ellia-v2-container.is-settings-open .v2-eye-ball {
  animation-play-state: running;
}

.ellia-v2-title {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.v2-name-cn {
  font-size: 1.1em;
  font-weight: 600;
  color: var(--e-accent);
  text-shadow: 0 0 5px var(--e-main);
}

.v2-name-en {
  font-size: 0.6em;
  font-family: 'Cinzel', serif;
  color: var(--e-main);
  letter-spacing: 2px;
  margin-top: 2px;
}

.ellia-v2-header-line {
  flex-grow: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--e-main), transparent);
  margin-left: 15px;
  opacity: 0.5;
  transition:
    background 0.35s ease,
    box-shadow 0.35s ease,
    opacity 0.35s ease;
}

.ellia-v2-container:hover .ellia-v2-header-line,
.ellia-v2-container.is-animating .ellia-v2-header-line,
.ellia-v2-container.is-settings-open .ellia-v2-header-line {
  background: linear-gradient(90deg, var(--e-accent), transparent);
  box-shadow: 0 0 5px var(--e-main);
}

.ellia-v2-debug-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.38rem;
  margin-bottom: 0.55rem;
}

.ellia-v2-debug-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.6rem;
  padding: 0.1rem 0.52rem;
  border-radius: 999px;
  border: 1px solid rgba(224, 176, 255, 0.32);
  background: rgba(62, 22, 77, 0.82);
  color: #f1dcff;
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  text-shadow: 0 0 4px rgba(155, 89, 182, 0.45);
}

.ellia-v2-content {
  color: #eee;
  font-size: 0.95em;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  position: relative;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.2em;
}

.ellia-v2-line {
  min-height: 1.6em;
  white-space: pre-wrap;
  word-break: break-word;
}

.ellia-v2-action {
  color: #e09fe3;
}

.ellia-v2-char {
  opacity: 0;
  display: inline-block;
}

.ellia-v2-char.is-first-char {
  font-size: 1.3em;
  color: var(--e-accent);
  margin-right: 2px;
  font-family: 'Cinzel', serif;
  text-shadow: 0 0 5px var(--e-main);
}

.ellia-v2-corner-controls {
  position: absolute;
  top: 10px;
  right: 12px;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.45rem;
  flex-wrap: wrap;
  max-width: calc(100% - 24px);
}

.ellia-v2-control-button {
  border: 1px solid rgba(224, 176, 255, 0.78);
  border-radius: 999px;
  background: rgba(46, 16, 53, 0.9);
  color: #f4ddff;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(155, 89, 182, 0.25);
  transition:
    background 0.22s ease,
    transform 0.22s ease,
    box-shadow 0.22s ease;
}

.ellia-v2-control-button:hover {
  background: rgba(78, 30, 91, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 0 16px rgba(224, 176, 255, 0.35);
}

.ellia-v2-settings-button,
.ellia-v2-replay-button {
  width: 32px;
  height: 32px;
  font-size: 0.95rem;
}

.ellia-v2-settings-button {
  order: 2;
  flex: 0 0 auto;
}

.ellia-v2-play-button,
.ellia-v2-replay-button {
  order: 1;
}

.ellia-v2-play-button {
  min-width: 68px;
  height: 32px;
  padding: 0 0.9rem;
  font-size: 0.76rem;
  letter-spacing: 0.06em;
}

.ellia-v2-root[data-animations-enabled='false'] .r1,
.ellia-v2-root[data-animations-enabled='false'] .r2,
.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-star-dust,
.ellia-v2-root[data-animations-enabled='false'] .v2-eye-ball {
  animation: none !important;
}

.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-container,
.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-magic-circle-layer,
.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-header-line,
.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-control-button,
.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-settings-option,
.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-settings-close {
  transition: none !important;
}

.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-container:hover,
.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-container.is-animating,
.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-container.is-settings-open {
  border-color: rgba(155, 89, 182, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-container:hover .ellia-v2-magic-circle-layer,
.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-container.is-animating .ellia-v2-magic-circle-layer,
.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-container.is-settings-open .ellia-v2-magic-circle-layer {
  opacity: 0.1;
  transform: translate(-50%, -50%) scale(0.8);
}

.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-container:hover .ellia-v2-header-line,
.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-container.is-animating .ellia-v2-header-line,
.ellia-v2-root[data-animations-enabled='false'] .ellia-v2-container.is-settings-open .ellia-v2-header-line {
  background: linear-gradient(90deg, var(--e-main), transparent);
  box-shadow: none;
}

@keyframes v2-spin {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes v2-blink-look {
  0%,
  45%,
  55%,
  100% {
    transform: translate(0, 0) scaleY(1);
    opacity: 1;
  }
  50% {
    transform: translate(0, 0) scaleY(0.1);
    opacity: 0.7;
  }
  20% {
    transform: translate(-1px, 0);
  }
  80% {
    transform: translate(1px, 0);
  }
}

@keyframes v2-twinkle {
  0% {
    opacity: 0.2;
    transform: scale(1);
  }
  100% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

@media (max-width: 640px) {
  .ellia-v2-card-inner {
    padding: 50px 14px 12px;
  }

  .ellia-v2-corner-controls {
    top: 8px;
    right: 8px;
    gap: 0.35rem;
  }

  .ellia-v2-settings-button,
  .ellia-v2-replay-button {
    width: 30px;
    height: 30px;
  }

  .ellia-v2-play-button {
    min-width: 60px;
    height: 30px;
    padding: 0 0.72rem;
  }

  .ellia-v2-debug-pill {
    font-size: 0.64rem;
  }
}
</style>
