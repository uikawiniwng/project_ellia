<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { quickReplyOptionGroups } from '../constants';
import type { DialogBeautyStorySettings, SkillMode } from '../types';

const props = defineProps<{
  storySettings: DialogBeautyStorySettings;
}>();

const emit = defineEmits<{
  (event: 'back'): void;
  (event: 'set-skill', skillKey: 'skill1', mode: SkillMode): void;
  (event: 'quick-reply', text: string): void;
}>();

const activePage = ref<'settings' | 'detail'>('settings');
const displayedSkill = ref<SkillMode>(props.storySettings.skill1 || 'A');
const isTurning = ref(false);

const skillOptions: Array<{ value: SkillMode; label: string }> = [
  { value: 'A', label: '关闭技能 1' },
  { value: 'B', label: '独一无二' },
  { value: 'C', label: '大千世界的你与我' },
];

const skillContentMap: Record<SkillMode, { flavor: string; status: string }> = {
  A: {
    flavor: '「 水晶球已封存，命运沉寂 」',
    status: '关闭技能 1',
  },
  B: {
    flavor: '「 预见命运的轨迹，唯你唯一 」',
    status: '独一无二',
  },
  C: {
    flavor: '「 拨开大千世界的迷雾 」',
    status: '大千世界的你与我',
  },
};

let flipStartTimer: number | null = null;
let flipEndTimer: number | null = null;

const displayedSkillContent = computed(() => skillContentMap[displayedSkill.value] || skillContentMap.A);

const pageNavLabel = computed(() => (activePage.value === 'settings' ? '翻到下一页' : '返回设置页'));

function clearFlipTimers() {
  if (flipStartTimer !== null) {
    window.clearTimeout(flipStartTimer);
    flipStartTimer = null;
  }
  if (flipEndTimer !== null) {
    window.clearTimeout(flipEndTimer);
    flipEndTimer = null;
  }
}

function playFlip(nextSkill: SkillMode) {
  clearFlipTimers();
  isTurning.value = true;
  flipStartTimer = window.setTimeout(() => {
    displayedSkill.value = nextSkill;
  }, 300);
  flipEndTimer = window.setTimeout(() => {
    isTurning.value = false;
  }, 400);
}

function togglePage() {
  activePage.value = activePage.value === 'settings' ? 'detail' : 'settings';
}

function replayCurrentSkill() {
  playFlip(props.storySettings.skill1 || 'A');
}

watch(
  () => props.storySettings.skill1,
  (nextSkill, previousSkill) => {
    const nextValue = nextSkill || 'A';
    if (!previousSkill) {
      displayedSkill.value = nextValue;
      return;
    }
    if (nextValue !== displayedSkill.value) {
      playFlip(nextValue);
    }
  },
);

onBeforeUnmount(() => {
  clearFlipTimers();
});
</script>

<template>
  <section class="ellia-skill1-shell" :class="{ 'is-detail': activePage === 'detail' }">
    <button type="button" class="ellia-skill1-nav-btn ellia-skill1-nav-btn-left" @click="emit('back')">
      ← 返回索引
    </button>
    <button type="button" class="ellia-skill1-nav-btn ellia-skill1-nav-btn-right" @click="togglePage">
      {{ pageNavLabel }} →
    </button>

    <svg
      v-if="activePage === 'detail'"
      class="ellia-skill1-bg-watermark"
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

    <div class="ellia-skill1-inner-frame">
      <div class="ellia-skill1-frame-dot dot-tl"></div>
      <div class="ellia-skill1-frame-dot dot-tr"></div>
      <div class="ellia-skill1-frame-dot dot-bl"></div>
      <div class="ellia-skill1-frame-dot dot-br"></div>
    </div>

    <template v-if="activePage === 'settings'">
      <div class="ellia-skill1-pane ellia-skill1-pane-left">
        <div class="ellia-skill1-settings-title">FIRST SKILL SLOT</div>
        <div class="ellia-skill1-settings-options">
          <button
            v-for="option in skillOptions"
            :key="option.value"
            type="button"
            class="ellia-skill1-settings-option"
            :class="{ 'is-active': storySettings.skill1 === option.value }"
            @click="emit('set-skill', 'skill1', option.value)"
          >
            {{ option.label }}
          </button>
        </div>

        <div class="ellia-skill1-divider"></div>

        <div class="ellia-skill1-settings-title">QUICK REPLY</div>
        <div class="ellia-skill1-settings-options">
          <button
            v-for="option in quickReplyOptionGroups.skill1"
            :key="option"
            type="button"
            class="ellia-skill1-settings-option ellia-skill1-quick-reply-btn"
            @click="emit('quick-reply', option)"
          >
            {{ option }}
          </button>
        </div>
      </div>

      <div class="ellia-skill1-pane ellia-skill1-pane-right">
        <div class="ellia-skill1-detail-title">水晶球</div>
        <div class="ellia-skill1-detail-subtitle">Crystal Orb</div>

        <button type="button" class="ellia-skill1-orb-wrapper" @click="replayCurrentSkill">
          <svg class="ellia-skill1-svg-orb" viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="ellia-skill1-glass-base" cx="50%" cy="50%" r="50%">
                <stop offset="80%" stop-color="#140a20" stop-opacity="0.6" />
                <stop offset="95%" stop-color="#4a2366" stop-opacity="0.8" />
                <stop offset="100%" stop-color="#d4af37" stop-opacity="0.5" />
              </radialGradient>
              <radialGradient id="ellia-skill1-mist-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#9b59b6" stop-opacity="0.4" />
                <stop offset="60%" stop-color="#2c1040" stop-opacity="0.8" />
                <stop offset="100%" stop-color="#000" stop-opacity="0.9" />
              </radialGradient>
            </defs>
            <circle cx="140" cy="140" r="130" fill="url(#ellia-skill1-glass-base)" />
            <g class="ellia-skill1-astrolabe-group">
              <circle
                cx="140"
                cy="140"
                r="110"
                fill="none"
                stroke="#d4af37"
                stroke-width="1"
                stroke-opacity="0.3"
                stroke-dasharray="2 6"
              />
              <path
                d="M140,40 L226,90 L226,190 L140,240 L54,190 L54,90 Z"
                fill="none"
                stroke="#d4af37"
                stroke-width="0.5"
                stroke-opacity="0.4"
              />
              <path
                d="M140,40 L140,240 M54,90 L226,190 M54,190 L226,90"
                stroke="#d4af37"
                stroke-width="0.5"
                stroke-opacity="0.2"
              />
              <circle cx="140" cy="140" r="3" fill="#fff" filter="drop-shadow(0 0 5px #fff)" />
            </g>
            <circle cx="140" cy="140" r="128" fill="url(#ellia-skill1-mist-grad)" class="ellia-skill1-mist-layer" />
            <ellipse cx="100" cy="70" rx="40" ry="20" fill="rgba(255,255,255,0.15)" transform="rotate(-30 100 70)" />
          </svg>
        </button>

        <div class="ellia-skill1-flip-card-container" :class="{ 'is-turning': isTurning }">
          <div class="ellia-skill1-flavor-text">
            {{ displayedSkillContent.flavor }}
          </div>

          <div class="ellia-skill1-ticket-detail-status">
            当前已启用 <span class="glow-text">{{ displayedSkillContent.status }}</span><br />
            <span class="ellia-skill1-status-note">设定将保存为聊天变量供 EJS 读取</span>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="ellia-skill1-pane ellia-skill1-pane-left">
        <div class="ellia-skill1-intro-greeting">
          “哟！旅伴~找到这里来啦？”<br /><br />
          <span>
            这里记录的是有关您的自我的能力的唔 介绍？有关于“天分”,也有关于“自己可以变成什么样的人”，当然是二选一的哦，做人不能太贪婪嘛。
          </span>
        </div>

        <div class="ellia-skill1-section-title">
          <svg viewBox="0 0 24 24">
            <polygon points="12 2 15 10 23 12 15 14 12 22 9 14 1 12 9 10" />
          </svg>
          命轨的锚定 (SKILL)
        </div>

        <div class="ellia-skill1-mechanic-item">
          <div class="ellia-skill1-mechanic-title">独一无二</div>
          <div class="ellia-skill1-mechanic-desc">
            总有那种说法吧？每个人都有与生俱来的天赋，或者特征。而我可以让这些更加显而易见...不过表现就是让您获得的所有技能都更有您的个人色彩
          </div>
        </div>
      </div>

      <div class="ellia-skill1-pane ellia-skill1-pane-right">
        <div class="ellia-skill1-section-title">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" stroke-dasharray="4 4" />
            <circle cx="12" cy="12" r="3" fill="#caa45d" />
          </svg>
          星海的羁绊 (VOYAGER)
        </div>

        <div class="ellia-skill1-mechanic-item">
          <div class="ellia-skill1-mechanic-title quick">大千世界的你与我</div>
          <div class="ellia-skill1-mechanic-desc">
            你有没有想过其他世界也有你存在？或许是一个骑士，或许是一个英雄，每个“您”都有自己的故事。而我也可以将您的这段故事记录下来，仅需要告诉我“记录你我的今生”。
          </div>
        </div>

        <div class="ellia-skill1-mechanic-item">
          <div class="ellia-skill1-mechanic-title quick">仅限今生的我和你</div>
          <div class="ellia-skill1-mechanic-desc">
            “既然留下了羁绊，自然也会有回音。若您听过其他位面的纪念册故事，不妨分享给我；若是没有，只需消耗少许FP并说出‘收下我们的赠礼’，我便能为您牵引来自星海彼端的异界馈赠。”
          </div>
        </div>

        <div class="ellia-skill1-lore-footer">
          [ 观测指南 ]<br />
          您拨动的每一条命运丝线，都会化作无形的符文被底层秩序（EJS变量）默默记住。
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped lang="scss">
.ellia-skill1-shell {
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

.ellia-skill1-shell.is-detail {
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.9),
    inset 0 0 60px rgba(202, 164, 93, 0.05);
}

.ellia-skill1-nav-btn {
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

.ellia-skill1-nav-btn:hover {
  color: #caa45d;
  text-shadow: 0 0 8px rgba(202, 164, 93, 0.6);
}

.ellia-skill1-nav-btn-left {
  left: 2.5rem;
}

.ellia-skill1-nav-btn-right {
  right: 2.5rem;
}

.ellia-skill1-nav-btn-left:hover {
  transform: translateX(-4px);
}

.ellia-skill1-nav-btn-right:hover {
  transform: translateX(4px);
}

.ellia-skill1-bg-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120%;
  height: 120%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 0;
  opacity: 0.06;
  animation: ellia-skill1-watermark-rotate 120s linear infinite;
}

.ellia-skill1-inner-frame {
  position: absolute;
  inset: 14px;
  z-index: 10;
  border: 1px solid rgba(202, 164, 93, 0.25);
  pointer-events: none;
}

.ellia-skill1-frame-dot {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #caa45d;
  border-radius: 50%;
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

.ellia-skill1-pane {
  position: relative;
  z-index: 5;
  flex: 1;
  margin-top: 0.5rem;
}

.ellia-skill1-pane-left {
  padding-right: 1.5rem;
}

.ellia-skill1-pane-left::after {
  content: '';
  position: absolute;
  top: 5%;
  right: -1.5rem;
  bottom: 5%;
  width: 1px;
  background: linear-gradient(to bottom, transparent, rgba(224, 176, 255, 0.25), transparent);
}

.ellia-skill1-pane-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-left: 1.5rem;
  perspective: 1000px;
}

.ellia-skill1-settings-title {
  margin-bottom: 1.2rem;
  color: rgba(202, 164, 93, 0.7);
  font-size: 0.8rem;
  letter-spacing: 0.3em;
  text-align: center;
}

.ellia-skill1-settings-options {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.ellia-skill1-settings-option {
  position: relative;
  z-index: 20;
  padding: 0.8rem 1rem;
  border: none;
  border-bottom: 1px solid rgba(224, 176, 255, 0.05);
  background: transparent;
  color: rgba(240, 220, 252, 0.6);
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.ellia-skill1-settings-option:hover {
  color: #fff;
  border-bottom-color: rgba(224, 176, 255, 0.3);
  text-shadow: 0 0 10px rgba(224, 176, 255, 0.8);
}

.ellia-skill1-settings-option.is-active {
  color: #caa45d;
  border-bottom: 1px solid rgba(202, 164, 93, 0.5);
  background: radial-gradient(ellipse at bottom, rgba(202, 164, 93, 0.15) 0%, transparent 60%);
  text-shadow: 0 0 15px rgba(202, 164, 93, 0.6);
}

.ellia-skill1-settings-option.is-active::before {
  content: '✦ ';
  font-size: 0.75rem;
  margin-right: 4px;
}

.ellia-skill1-settings-option.is-active::after {
  content: ' ✦';
  font-size: 0.75rem;
  margin-left: 4px;
}

.ellia-skill1-quick-reply-btn:active {
  background: rgba(224, 176, 255, 0.1);
}

.ellia-skill1-divider {
  width: 100%;
  height: 1px;
  margin: 2rem 0;
  background: linear-gradient(90deg, transparent, rgba(224, 176, 255, 0.25), transparent);
}

.ellia-skill1-detail-title {
  margin-bottom: 0.2rem;
  color: #caa45d;
  font-size: 1.2rem;
  letter-spacing: 0.2em;
  text-align: center;
  text-shadow: 0 0 12px rgba(202, 164, 93, 0.4);
}

.ellia-skill1-detail-subtitle {
  margin-bottom: 1rem;
  color: rgba(224, 176, 255, 0.5);
  font-size: 0.65rem;
  letter-spacing: 0.4em;
  text-transform: uppercase;
}

.ellia-skill1-orb-wrapper {
  position: relative;
  z-index: 20;
  width: 200px;
  height: 200px;
  margin-bottom: 1.5rem;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.ellia-skill1-svg-orb {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 15px rgba(155, 89, 182, 0.4));
  transition: filter 0.5s ease;
}

.ellia-skill1-orb-wrapper:hover .ellia-skill1-svg-orb {
  filter: drop-shadow(0 0 30px rgba(212, 175, 55, 0.5));
}

.ellia-skill1-astrolabe-group {
  transform-origin: 140px 140px;
  animation: ellia-skill1-spin 40s linear infinite;
}

.ellia-skill1-orb-wrapper:hover .ellia-skill1-astrolabe-group {
  animation-duration: 10s;
}

.ellia-skill1-mist-layer {
  transform-origin: 140px 140px;
  animation: ellia-skill1-spin-reverse 25s linear infinite;
  transition: opacity 0.8s ease;
}

.ellia-skill1-orb-wrapper:hover .ellia-skill1-mist-layer {
  opacity: 0.1;
}

.ellia-skill1-flip-card-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  transform-style: preserve-3d;
  transition:
    transform 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.4s ease;
}

.ellia-skill1-flip-card-container.is-turning {
  transform: rotateX(90deg) scale(0.95);
  opacity: 0;
}

.ellia-skill1-flavor-text {
  margin-bottom: 1.5rem;
  color: #e0b0ff;
  font-size: 1rem;
  letter-spacing: 0.1em;
  text-align: center;
  text-shadow: 0 0 8px rgba(155, 89, 182, 0.6);
}

.ellia-skill1-ticket-detail-status {
  width: 90%;
  padding-top: 1rem;
  border-top: 1px solid rgba(202, 164, 93, 0.3);
  color: #f1dcff;
  font-size: 0.8rem;
  line-height: 1.8;
  text-align: center;
}

.ellia-skill1-ticket-detail-status .glow-text {
  padding: 0 4px;
  color: #caa45d;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(202, 164, 93, 0.8);
}

.ellia-skill1-status-note {
  opacity: 0.4;
  font-size: 0.7rem;
}

.ellia-skill1-intro-greeting {
  position: relative;
  margin-bottom: 2rem;
  color: #e0b0ff;
  font-size: 0.95rem;
  line-height: 1.8;
  letter-spacing: 0.05em;
  text-align: justify;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
}

.ellia-skill1-intro-greeting span {
  color: #caa45d;
  opacity: 0.9;
}

.ellia-skill1-section-title {
  display: flex;
  align-items: center;
  margin-bottom: 1.2rem;
  color: #caa45d;
  font-size: 0.9rem;
  letter-spacing: 0.2em;
  text-shadow: 0 0 10px rgba(202, 164, 93, 0.4);
}

.ellia-skill1-section-title svg {
  width: 14px;
  height: 14px;
  margin-right: 8px;
  fill: none;
  stroke: #caa45d;
  stroke-width: 1.5;
}

.ellia-skill1-mechanic-item {
  margin-bottom: 1.5rem;
}

.ellia-skill1-mechanic-title {
  display: flex;
  align-items: center;
  margin-bottom: 0.4rem;
  color: #f1dcff;
  font-size: 0.95rem;
  font-weight: 600;
  text-shadow: 0 0 5px rgba(155, 89, 182, 0.5);
}

.ellia-skill1-mechanic-title::before {
  content: '✦';
  margin-right: 6px;
  color: #caa45d;
  font-size: 0.7rem;
}

.ellia-skill1-mechanic-title.quick::before {
  content: '✧';
  color: #e0b0ff;
}

.ellia-skill1-mechanic-desc {
  padding-left: 1.2rem;
  color: rgba(220, 200, 255, 0.7);
  font-size: 0.85rem;
  line-height: 1.8;
  text-align: justify;
}

.ellia-skill1-lore-footer {
  margin-top: auto;
  padding-top: 1.2rem;
  border-top: 1px dashed rgba(202, 164, 93, 0.2);
  color: rgba(202, 164, 93, 0.6);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  line-height: 1.6;
  text-align: center;
}

:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-skill1-nav-btn),
:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-skill1-settings-option),
:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-skill1-svg-orb),
:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-skill1-flip-card-container) {
  transition: none !important;
}

@keyframes ellia-skill1-spin {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes ellia-skill1-spin-reverse {
  100% {
    transform: rotate(-360deg);
  }
}

@keyframes ellia-skill1-watermark-rotate {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@media (max-width: 900px) {
  .ellia-skill1-shell {
    flex-direction: column;
    gap: 1.5rem;
    min-height: auto;
    padding: 3.2rem 1.4rem 1.4rem;
  }

  .ellia-skill1-pane-left,
  .ellia-skill1-pane-right {
    padding: 0;
  }

  .ellia-skill1-pane-left::after {
    display: none;
  }
}

@media (max-width: 640px) {
  .ellia-skill1-shell {
    padding: 3rem 1rem 1rem;
  }

  .ellia-skill1-nav-btn {
    font-size: 0.72rem;
  }

  .ellia-skill1-nav-btn-left {
    left: 1rem;
  }

  .ellia-skill1-nav-btn-right {
    right: 1rem;
  }

  .ellia-skill1-settings-option {
    padding: 0.72rem 0.8rem;
    font-size: 0.88rem;
  }

  .ellia-skill1-detail-title {
    font-size: 1.05rem;
  }

  .ellia-skill1-flavor-text {
    font-size: 0.92rem;
  }
}
</style>
