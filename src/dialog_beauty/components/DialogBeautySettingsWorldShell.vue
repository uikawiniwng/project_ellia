<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { blueStoryStyleOptions, elliaFormLabels, formTypeOptions, skillOptionGroups } from '../constants';
import { safeGetVariables } from '../settings';
import type { DialogBeautyStorySettings, FormType, SkillMode, StoryStyleMode } from '../types';

const props = defineProps<{
  storySettings: DialogBeautyStorySettings;
  isStoryStyleDiyOpen: boolean;
  storyStyleDiyDraft: string;
  storyStyleDiyStatus: string;
}>();

const emit = defineEmits<{
  (event: 'back'): void;
  (event: 'set-form-type', mode: FormType): void;
  (event: 'set-skill', skillKey: 'skill3', mode: SkillMode): void;
  (event: 'set-story-style', mode: StoryStyleMode): void;
  (event: 'open-story-style-diy'): void;
  (event: 'close-story-style-diy'): void;
  (event: 'request-story-style-suggestion'): void;
  (event: 'save-story-style-diy'): void;
  (event: 'update:story-style-diy-draft', value: string): void;
  (event: 'quick-reply', text: string): void;
}>();

const activePage = ref<'settings' | 'detail'>('settings');
const divinationText = ref('[ 等待倾听 ]');
const isDivinationVisible = ref(false);
let divinationTimer: number | null = null;

const afternoonTeaNewsKeys = ['社交逸闻', '千里远望', '命运涟漪', '邂逅预兆'] as const;

const pageNavLabel = computed(() => (activePage.value === 'settings' ? '翻到下一页' : '切回上一页'));

const formDisplayOptions = computed(() => {
  const order: FormType[] = ['B', 'A', 'C'];
  return order
    .map(mode => formTypeOptions.find(option => option.value === mode))
    .filter((option): option is { value: FormType; label: string } => Boolean(option));
});

const isCustomStoryStyleActive = computed(() => props.isStoryStyleDiyOpen || props.storySettings.skill4 === 'CUSTOM');

function togglePage() {
  activePage.value = activePage.value === 'settings' ? 'detail' : 'settings';
}

function setFormTypeWithPrompt(mode: FormType) {
  const isSwitchingForm = props.storySettings.formType !== mode;
  emit('set-form-type', mode);

  if (isSwitchingForm) {
    emit('quick-reply', `让艾莉亚${elliaFormLabels[mode]}`);
  }
}

function getRandomAfternoonTeaNews(): string {
  const messageVariables = safeGetVariables({ type: 'message', message_id: getCurrentMessageId() } as VariableOption);
  const afternoonTeaNews = _.get(messageVariables, ['stat_data', '新闻', '午后茶会']);

  if (!afternoonTeaNews || typeof afternoonTeaNews !== 'object') {
    return '....';
  }

  const candidates = afternoonTeaNewsKeys
    .map(key => String(_.get(afternoonTeaNews, key) ?? '').trim())
    .filter((value): value is string => Boolean(value));

  if (candidates.length === 0) {
    return '....';
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}

function pluckFlower() {
  if (divinationTimer !== null) {
    window.clearTimeout(divinationTimer);
    divinationTimer = null;
  }

  const result = getRandomAfternoonTeaNews();
  isDivinationVisible.value = false;
  divinationTimer = window.setTimeout(() => {
    divinationText.value = result;
    isDivinationVisible.value = true;
  }, 400);
}

onBeforeUnmount(() => {
  if (divinationTimer !== null) {
    window.clearTimeout(divinationTimer);
  }
});
</script>

<template>
  <section class="ellia-world-shell" :class="{ 'is-detail': activePage === 'detail' }">
    <button type="button" class="ellia-world-nav-btn ellia-world-nav-btn-left" @click="emit('back')">← 返回索引</button>
    <button type="button" class="ellia-world-nav-btn ellia-world-nav-btn-right" @click="togglePage">
      {{ pageNavLabel }} →
    </button>

    <svg
      v-if="activePage === 'detail'"
      class="ellia-world-bg-watermark"
      viewBox="0 0 800 800"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="#caa45d" fill="none" stroke-width="0.5">
        <circle cx="400" cy="400" r="380" stroke-dasharray="4 8" opacity="0.5" />
        <circle cx="400" cy="400" r="300" />
        <circle cx="400" cy="400" r="280" stroke-dasharray="2 4" />
        <circle cx="400" cy="400" r="150" />
        <polygon points="400,100 660,250 660,550 400,700 140,550 140,250" opacity="0.6" />
        <polygon points="400,120 640,260 640,540 400,680 160,540 160,260" opacity="0.3" />
        <path d="M400,100 L400,700 M140,250 L660,550 M140,550 L660,250" opacity="0.4" />
        <path d="M250,400 Q400,250 550,400 Q400,550 250,400" stroke-width="1" opacity="0.8" />
        <circle cx="400" cy="400" r="40" stroke-width="1" />
        <circle cx="400" cy="400" r="10" fill="#caa45d" opacity="0.5" />
      </g>
    </svg>

    <div class="ellia-world-inner-frame">
      <div class="ellia-world-frame-dot dot-tl"></div>
      <div class="ellia-world-frame-dot dot-tr"></div>
      <div class="ellia-world-frame-dot dot-bl"></div>
      <div class="ellia-world-frame-dot dot-br"></div>
    </div>

    <template v-if="activePage === 'settings'">
      <div class="ellia-world-pane ellia-world-pane-left">
        <div class="ellia-world-settings-title">FORM</div>
        <div class="ellia-world-settings-options">
          <button
            v-for="option in formDisplayOptions"
            :key="option.value"
            type="button"
            class="ellia-world-settings-option"
            :class="{ 'is-active': storySettings.formType === option.value }"
            @click="setFormTypeWithPrompt(option.value)"
          >
            {{ option.label }}
          </button>
        </div>

        <div class="ellia-world-divider"></div>

        <div class="ellia-world-settings-title">THIRD SKILL SLOT</div>
        <div class="ellia-world-settings-options">
          <button
            v-for="option in skillOptionGroups.skill3"
            :key="option.value"
            type="button"
            class="ellia-world-settings-option"
            :class="{ 'is-active': storySettings.skill3 === option.value }"
            @click="emit('set-skill', 'skill3', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="ellia-world-pane ellia-world-pane-right">
        <button type="button" class="ellia-world-flower-wrapper" @click="pluckFlower">
          <svg class="ellia-world-svg-flower" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="ellia-world-flower-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#fff" stop-opacity="1" />
                <stop offset="30%" stop-color="#fdf4ff" stop-opacity="0.9" />
                <stop offset="100%" stop-color="#e0b0ff" stop-opacity="0" />
              </radialGradient>
              <linearGradient id="ellia-world-petal-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stop-color="rgba(255,255,255,0)" />
                <stop offset="100%" stop-color="rgba(255,255,255,0.75)" />
              </linearGradient>
            </defs>
            <g transform="translate(100, 100)">
              <circle
                cx="0"
                cy="0"
                r="75"
                fill="none"
                stroke="rgba(202, 164, 93, 0.2)"
                stroke-width="1"
                stroke-dasharray="2 6"
              />
              <circle cx="0" cy="0" r="45" fill="none" stroke="rgba(224, 176, 255, 0.15)" stroke-width="0.5" />

              <g stroke="rgba(224, 176, 255, 0.4)" stroke-width="1" fill="none">
                <path d="M0,0 C35,-45 20,-85 0,-95 C-20,-85 -35,-45 0,0 Z" />
                <path d="M0,0 C35,-45 20,-85 0,-95 C-20,-85 -35,-45 0,0 Z" transform="rotate(45)" />
                <path d="M0,0 C35,-45 20,-85 0,-95 C-20,-85 -35,-45 0,0 Z" transform="rotate(90)" />
                <path d="M0,0 C35,-45 20,-85 0,-95 C-20,-85 -35,-45 0,0 Z" transform="rotate(135)" />
                <path d="M0,0 C35,-45 20,-85 0,-95 C-20,-85 -35,-45 0,0 Z" transform="rotate(180)" />
                <path d="M0,0 C35,-45 20,-85 0,-95 C-20,-85 -35,-45 0,0 Z" transform="rotate(225)" />
                <path d="M0,0 C35,-45 20,-85 0,-95 C-20,-85 -35,-45 0,0 Z" transform="rotate(270)" />
                <path d="M0,0 C35,-45 20,-85 0,-95 C-20,-85 -35,-45 0,0 Z" transform="rotate(315)" />
              </g>

              <g fill="url(#ellia-world-petal-grad)" stroke="rgba(255, 255, 255, 0.9)" stroke-width="1.2">
                <path d="M0,0 C25,-35 15,-65 0,-75 C-15,-65 -25,-35 0,0 Z" transform="rotate(22.5)" />
                <path d="M0,0 C25,-35 15,-65 0,-75 C-15,-65 -25,-35 0,0 Z" transform="rotate(67.5)" />
                <path d="M0,0 C25,-35 15,-65 0,-75 C-15,-65 -25,-35 0,0 Z" transform="rotate(112.5)" />
                <path d="M0,0 C25,-35 15,-65 0,-75 C-15,-65 -25,-35 0,0 Z" transform="rotate(157.5)" />
                <path d="M0,0 C25,-35 15,-65 0,-75 C-15,-65 -25,-35 0,0 Z" transform="rotate(202.5)" />
                <path d="M0,0 C25,-35 15,-65 0,-75 C-15,-65 -25,-35 0,0 Z" transform="rotate(247.5)" />
                <path d="M0,0 C25,-35 15,-65 0,-75 C-15,-65 -25,-35 0,0 Z" transform="rotate(292.5)" />
                <path d="M0,0 C25,-35 15,-65 0,-75 C-15,-65 -25,-35 0,0 Z" transform="rotate(337.5)" />
              </g>

              <g fill="rgba(255, 255, 255, 0.2)" stroke="#fff" stroke-width="0.8">
                <path d="M0,0 C12,-20 8,-40 0,-45 C-8,-40 -12,-20 0,0 Z" />
                <path d="M0,0 C12,-20 8,-40 0,-45 C-8,-40 -12,-20 0,0 Z" transform="rotate(45)" />
                <path d="M0,0 C12,-20 8,-40 0,-45 C-8,-40 -12,-20 0,0 Z" transform="rotate(90)" />
                <path d="M0,0 C12,-20 8,-40 0,-45 C-8,-40 -12,-20 0,0 Z" transform="rotate(135)" />
                <path d="M0,0 C12,-20 8,-40 0,-45 C-8,-40 -12,-20 0,0 Z" transform="rotate(180)" />
                <path d="M0,0 C12,-20 8,-40 0,-45 C-8,-40 -12,-20 0,0 Z" transform="rotate(225)" />
                <path d="M0,0 C12,-20 8,-40 0,-45 C-8,-40 -12,-20 0,0 Z" transform="rotate(270)" />
                <path d="M0,0 C12,-20 8,-40 0,-45 C-8,-40 -12,-20 0,0 Z" transform="rotate(315)" />
              </g>

              <circle cx="0" cy="0" r="22" fill="url(#ellia-world-flower-glow)" />
              <circle cx="0" cy="0" r="4" fill="#fff" filter="drop-shadow(0 0 6px #fff)" />
              <path d="M-10,0 L10,0 M0,-10 L0,10" stroke="#caa45d" stroke-width="1.5" stroke-linecap="round" />
            </g>
          </svg>
        </button>

        <div class="ellia-world-divination-result" :class="{ 'is-visible': isDivinationVisible }">
          {{ divinationText }}
        </div>

        <div class="ellia-world-settings-title ellia-world-fourth-title">FOURTH SKILL</div>

        <div class="ellia-world-settings-subtitle">Responsive</div>
        <div class="ellia-world-settings-options">
          <button
            type="button"
            class="ellia-world-settings-option"
            :class="{ 'is-active': storySettings.skill4 === 'WORLD' }"
            @click="emit('set-story-style', 'WORLD')"
          >
            当前的故事风格由世界本身决定
          </button>
        </div>

        <div class="ellia-world-settings-subtitle">Blaue Blume</div>
        <div class="ellia-world-settings-grid">
          <button
            v-for="option in blueStoryStyleOptions"
            :key="option.value"
            type="button"
            class="ellia-world-settings-option"
            :class="{ 'is-active': storySettings.skill4 === option.value }"
            @click="emit('set-story-style', option.value)"
          >
            {{ option.label }}
          </button>
        </div>

        <div class="ellia-world-settings-subtitle">Rote Blume</div>
        <div class="ellia-world-settings-options">
          <button
            type="button"
            class="ellia-world-settings-option"
            :class="{ 'is-active': isCustomStoryStyleActive }"
            @click="emit('open-story-style-diy')"
          >
            自定义
          </button>
        </div>

        <div v-if="storyStyleDiyStatus && !isStoryStyleDiyOpen" class="ellia-world-settings-status">
          {{ storyStyleDiyStatus }}
        </div>

        <div v-if="isStoryStyleDiyOpen" class="ellia-world-custom-style-container">
          <textarea
            :value="storyStyleDiyDraft"
            class="ellia-world-custom-textarea"
            placeholder="输入你想要的自定义故事风格"
            @input="emit('update:story-style-diy-draft', ($event.target as HTMLTextAreaElement).value)"
          ></textarea>
          <div class="ellia-world-custom-actions">
            <button type="button" class="ellia-world-action-btn-momentary" @click="emit('save-story-style-diy')">
              传送
            </button>
            <button
              type="button"
              class="ellia-world-action-btn-momentary"
              @click="emit('request-story-style-suggestion')"
            >
              帮我想/优化！
            </button>
            <button type="button" class="ellia-world-action-btn-momentary" @click="emit('close-story-style-diy')">
              取消
            </button>
          </div>
          <div v-if="storyStyleDiyStatus" class="ellia-world-settings-status">
            {{ storyStyleDiyStatus }}
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="ellia-world-pane ellia-world-pane-left">
        <div class="ellia-world-intro-greeting">
          “哟！旅伴~觉得现在的节奏太快，还是有些无聊了呢？”<br /><br />
          <span
            >这里记录着有关“方向”与“色彩”的魔法。如果您想在这个世界寻找些新的乐子，或者仅仅是想换个心情，不妨听听我的建议哦。</span
          >
        </div>

        <div class="ellia-world-section-title">
          <svg viewBox="0 0 24 24">
            <polygon points="12 2 15 10 23 12 15 14 12 22 9 14 1 12 9 10" />
          </svg>
          命轨的指引 (GUIDANCE)
        </div>

        <div class="ellia-world-mechanic-item">
          <div class="ellia-world-mechanic-title">您的故事</div>
          <div class="ellia-world-mechanic-desc">
            偶尔也会有迷失方向的时候吧？只要您明确地向我开口，说出“需要一个目标”或是“找点事做”，我便会在命运的丝线中，为您筛选出几个符合您当前身份与心境的契机。当然，选择权永远在您手中。
          </div>
        </div>
      </div>

      <div class="ellia-world-pane ellia-world-pane-right ellia-world-pane-right-detail">
        <div class="ellia-world-section-title">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" stroke-dasharray="4 4" />
            <circle cx="12" cy="12" r="3" fill="#caa45d" />
          </svg>
          命轨的色彩 (NARRATIVE STYLE)
        </div>

        <div class="ellia-world-mechanic-item">
          <div class="ellia-world-mechanic-title quick">Blaue Blume (蓝花)</div>
          <div class="ellia-world-mechanic-desc">
            世界的模样，取决于您注视它的方式。当蓝色的花瓣飘落，您可以自由选择接下来的日常基调——是充满欢笑的冒险，热血的王道展开，还是带着些许诡谲的探秘？由您来定。
          </div>
        </div>

        <div class="ellia-world-mechanic-item">
          <div class="ellia-world-mechanic-title quick">Rote Blume (红花)</div>
          <div class="ellia-world-mechanic-desc">
            如果不满足于既定的色彩，那就亲手用红花来浸染吧。告诉我您想要的自定义故事氛围，哪怕只是一点模糊的偏好，我也会帮您整理、优化，并将其铭刻进世界的底层规则中。
          </div>
        </div>

        <div class="ellia-world-lore-footer">
          [ 观测指南 ]<br />
          您拨动的每一条命运丝线，都会化作无形的符文被底层秩序（EJS变量）默默记住。
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped lang="scss">
.ellia-world-shell {
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

.ellia-world-shell.is-detail {
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.9),
    inset 0 0 60px rgba(202, 164, 93, 0.05);
}

.ellia-world-nav-btn {
  position: absolute;
  top: 1.2rem;
  z-index: 20;
  display: flex;
  align-items: center;
  border: none;
  background: transparent;
  color: rgba(224, 176, 255, 0.5);
  font-family: 'Noto Serif SC', serif;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ellia-world-nav-btn:hover {
  color: #caa45d;
  text-shadow: 0 0 8px rgba(202, 164, 93, 0.6);
}

.ellia-world-nav-btn-left {
  left: 2.5rem;
}

.ellia-world-nav-btn-right {
  right: 2.5rem;
}

.ellia-world-nav-btn-left:hover {
  transform: translateX(-4px);
}

.ellia-world-nav-btn-right:hover {
  transform: translateX(4px);
}

.ellia-world-bg-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 0;
  width: 120%;
  height: 120%;
  opacity: 0.06;
  pointer-events: none;
  animation: ellia-world-watermark-rotate 120s linear infinite;
}

.ellia-world-inner-frame {
  position: absolute;
  inset: 14px;
  z-index: 10;
  border: 1px solid rgba(202, 164, 93, 0.25);
  pointer-events: none;
}

.ellia-world-frame-dot {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #caa45d;
  box-shadow:
    0 0 8px #caa45d,
    0 0 15px rgba(202, 164, 93, 0.6);
}

.dot-tl {
  top: -2.5px;
  left: -2.5px;
}

.dot-tr {
  top: -2.5px;
  right: -2.5px;
}

.dot-bl {
  bottom: -2.5px;
  left: -2.5px;
}

.dot-br {
  right: -2.5px;
  bottom: -2.5px;
}

.ellia-world-pane {
  position: relative;
  z-index: 5;
  margin-top: 0.5rem;
}

.ellia-world-pane-left {
  flex: 0.9;
  padding-right: 2rem;
}

.ellia-world-pane-left::after {
  content: '';
  position: absolute;
  top: 5%;
  right: -1.5rem;
  bottom: 5%;
  width: 1px;
  background: linear-gradient(to bottom, transparent, rgba(224, 176, 255, 0.25), transparent);
}

.ellia-world-pane-right {
  display: flex;
  flex: 1.1;
  flex-direction: column;
  align-items: center;
  padding-left: 1rem;
}

.ellia-world-pane-right-detail {
  align-items: stretch;
}

.ellia-world-settings-title {
  margin-bottom: 1.2rem;
  color: rgba(202, 164, 93, 0.7);
  font-size: 0.8rem;
  letter-spacing: 0.3em;
  text-align: center;
  text-transform: uppercase;
}

.ellia-world-fourth-title {
  margin-bottom: 0;
}

.ellia-world-settings-subtitle {
  margin: 0.8rem 0 0.4rem;
  color: rgba(224, 176, 255, 0.4);
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-align: center;
  text-transform: uppercase;
}

.ellia-world-settings-options {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
}

.ellia-world-settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
  width: 100%;
}

.ellia-world-settings-option {
  position: relative;
  z-index: 20;
  padding: 0.8rem 0.5rem;
  border: none;
  border-bottom: 1px solid rgba(224, 176, 255, 0.05);
  background: transparent;
  color: rgba(240, 220, 252, 0.6);
  font-family: inherit;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ellia-world-settings-option:hover {
  border-bottom-color: rgba(224, 176, 255, 0.3);
  color: #fff;
  text-shadow: 0 0 10px rgba(224, 176, 255, 0.8);
}

.ellia-world-settings-option.is-active {
  border-bottom: 1px solid rgba(202, 164, 93, 0.5);
  background: radial-gradient(ellipse at bottom, rgba(202, 164, 93, 0.15) 0%, transparent 60%);
  color: #caa45d;
  text-shadow: 0 0 15px rgba(202, 164, 93, 0.6);
}

.ellia-world-settings-option.is-active::before {
  content: '✦ ';
  margin-right: 4px;
  font-size: 0.7rem;
}

.ellia-world-settings-option.is-active::after {
  content: ' ✦';
  margin-left: 4px;
  font-size: 0.7rem;
}

.ellia-world-divider {
  width: 100%;
  height: 1px;
  margin: 2rem 0;
  background: linear-gradient(90deg, transparent, rgba(224, 176, 255, 0.25), transparent);
}

.ellia-world-flower-wrapper {
  position: relative;
  z-index: 20;
  width: 140px;
  height: 140px;
  margin-bottom: 0.5rem;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transition:
    transform 0.4s ease,
    filter 0.4s ease;
}

.ellia-world-flower-wrapper:hover {
  filter: drop-shadow(0 0 25px rgba(255, 255, 255, 0.4));
  transform: scale(1.05);
}

.ellia-world-flower-wrapper:active {
  transform: scale(0.95);
}

.ellia-world-svg-flower {
  width: 100%;
  height: 100%;
}

.ellia-world-divination-result {
  min-height: 26px;
  margin-bottom: 1.5rem;
  color: #fff;
  font-size: 1.1rem;
  letter-spacing: 0.2em;
  text-align: center;
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
  opacity: 0;
  transition: opacity 0.8s ease;
}

.ellia-world-divination-result.is-visible {
  opacity: 1;
}

.ellia-world-custom-style-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.5rem;
  animation: ellia-world-fade-in 0.4s ease forwards;
}

.ellia-world-custom-textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 80px;
  padding: 1rem;
  border: 1px solid rgba(224, 176, 255, 0.2);
  border-radius: 4px;
  background: rgba(15, 8, 22, 0.6);
  color: #f1dcff;
  font-family: inherit;
  font-size: 0.85rem;
  resize: none;
  outline: none;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.ellia-world-custom-textarea:focus {
  border-color: rgba(202, 164, 93, 0.6);
  box-shadow: 0 0 10px rgba(202, 164, 93, 0.2);
}

.ellia-world-custom-textarea::placeholder {
  color: rgba(224, 176, 255, 0.3);
  letter-spacing: 0.05em;
}

.ellia-world-custom-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
  width: 100%;
}

.ellia-world-action-btn-momentary {
  flex: 1;
  padding: 0.8rem 0.5rem;
  border: none;
  border-bottom: 1px solid transparent;
  background: transparent;
  color: rgba(224, 176, 255, 0.5);
  font-family: inherit;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-align: center;
  cursor: pointer;
  transition: all 0.1s ease;
}

.ellia-world-action-btn-momentary:hover {
  color: rgba(255, 255, 255, 0.8);
}

.ellia-world-action-btn-momentary:active {
  border-bottom: 1px solid rgba(202, 164, 93, 0.6);
  background: radial-gradient(ellipse at bottom, rgba(202, 164, 93, 0.2) 0%, transparent 70%);
  color: #caa45d;
  text-shadow: 0 0 15px rgba(202, 164, 93, 1);
}

.ellia-world-settings-status {
  width: 100%;
  margin-top: 0.52rem;
  padding: 0.5rem 0.7rem;
  border-left: 2px solid #caa45d;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(238, 216, 255, 0.82);
  font-size: 0.66rem;
  line-height: 1.45;
}

.ellia-world-intro-greeting {
  position: relative;
  margin-bottom: 2rem;
  color: #e0b0ff;
  font-size: 0.95rem;
  line-height: 1.8;
  letter-spacing: 0.05em;
  text-align: justify;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
}

.ellia-world-intro-greeting span {
  color: #caa45d;
  opacity: 0.9;
}

.ellia-world-section-title {
  display: flex;
  align-items: center;
  margin-bottom: 1.2rem;
  color: #caa45d;
  font-size: 0.9rem;
  letter-spacing: 0.2em;
  text-shadow: 0 0 10px rgba(202, 164, 93, 0.4);
}

.ellia-world-section-title svg {
  width: 14px;
  height: 14px;
  margin-right: 8px;
  fill: none;
  stroke: #caa45d;
  stroke-width: 1.5;
}

.ellia-world-mechanic-item {
  margin-bottom: 1.5rem;
}

.ellia-world-mechanic-title {
  display: flex;
  align-items: center;
  margin-bottom: 0.4rem;
  color: #f1dcff;
  font-size: 0.95rem;
  font-weight: 600;
  text-shadow: 0 0 5px rgba(155, 89, 182, 0.5);
}

.ellia-world-mechanic-title::before {
  content: '✦';
  margin-right: 6px;
  color: #caa45d;
  font-size: 0.7rem;
}

.ellia-world-mechanic-title.quick::before {
  content: '✧';
  color: #e0b0ff;
}

.ellia-world-mechanic-desc {
  padding-left: 1.2rem;
  color: rgba(220, 200, 255, 0.7);
  font-size: 0.85rem;
  line-height: 1.8;
  text-align: justify;
}

.ellia-world-lore-footer {
  margin-top: auto;
  padding-top: 1.2rem;
  border-top: 1px dashed rgba(202, 164, 93, 0.2);
  color: rgba(202, 164, 93, 0.6);
  font-size: 0.75rem;
  line-height: 1.6;
  letter-spacing: 0.1em;
  text-align: center;
}

:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-world-nav-btn),
:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-world-settings-option),
:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-world-flower-wrapper),
:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-world-divination-result),
:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-world-custom-textarea),
:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-world-action-btn-momentary) {
  transition: none !important;
}

:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-world-bg-watermark),
:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-world-custom-style-container) {
  animation: none !important;
}

@keyframes ellia-world-watermark-rotate {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes ellia-world-fade-in {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 900px) {
  .ellia-world-shell {
    flex-direction: column;
    gap: 1.5rem;
    min-height: auto;
    padding: 3.2rem 1.4rem 1.4rem;
  }

  .ellia-world-pane-left,
  .ellia-world-pane-right {
    flex: 1;
    padding: 0;
  }

  .ellia-world-pane-left::after {
    display: none;
  }
}

@media (max-width: 640px) {
  .ellia-world-shell {
    padding: 3rem 1rem 1rem;
  }

  .ellia-world-nav-btn {
    font-size: 0.72rem;
  }

  .ellia-world-nav-btn-left {
    left: 1rem;
  }

  .ellia-world-nav-btn-right {
    right: 1rem;
  }

  .ellia-world-settings-grid {
    grid-template-columns: 1fr;
  }

  .ellia-world-custom-actions {
    flex-direction: column;
  }
}
</style>
