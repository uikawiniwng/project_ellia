<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { quickReplyOptionGroups, skillOptionGroups } from '../constants';
import type { DialogBeautyStorySettings, SkillMode } from '../types';

const props = defineProps<{
  storySettings: DialogBeautyStorySettings;
}>();

const emit = defineEmits<{
  (event: 'back'): void;
  (event: 'set-skill', skillKey: 'skill2', mode: SkillMode): void;
  (event: 'quick-reply', text: string): void;
}>();

const activePage = ref<'settings' | 'detail'>('settings');
const displayedSkill = ref<SkillMode>(props.storySettings.skill2 || 'B');
const isTurning = ref(false);
const isDrawing = ref(false);
const drawnCard = ref('');
const drawnCardIsHidden = ref(false);

const skillContentMap: Record<SkillMode, { flavor: string; status: string }> = {
  A: {
    flavor: '「 塔罗牌静止，命运的齿轮停滞 」',
    status: '关闭技能 2',
  },
  B: {
    flavor: '「 命运的歧路，在此延伸出无限可能 」',
    status: '不止于此',
  },
  C: {
    flavor: '「 踏下足迹，收集散落于星海的碎片 」',
    status: '步履不停 / 瓮、星屑、步伐',
  },
};

const tarotPool = [
  '【 0. 愚者 The Fool 】',
  '【 I. 魔术师 The Magician 】',
  '【 II. 女祭司 The High Priestess 】',
  '【 III. 女皇 The Empress 】',
  '【 IV. 皇帝 The Emperor 】',
  '【 V. 教皇 The Hierophant 】',
  '【 VI. 恋人 The Lovers 】',
  '【 VII. 战车 The Chariot 】',
  '【 VIII. 力量 Strength 】',
  '【 IX. 隐士 The Hermit 】',
  '【 X. 命运之轮 Wheel of Fortune 】',
  '【 XI. 正义 Justice 】',
  '【 XII. 倒吊人 The Hanged Man 】',
  '【 XIII. 死神 Death 】',
  '【 XIV. 节制 Temperance 】',
  '【 XV. 恶魔 The Devil 】',
  '【 XVI. 高塔 The Tower 】',
  '【 XVII. 星星 The Star 】',
  '【 XVIII. 月亮 The Moon 】',
  '【 XIX. 太阳 The Sun 】',
  '【 XX. 审判 Judgement 】',
  '【 XXI. 世界 The World 】',
  '【 隐藏款：河马 The Hippo 】',
] as const;

let flipStartTimer: number | null = null;
let flipEndTimer: number | null = null;
let drawRevealTimer: number | null = null;
let drawEndTimer: number | null = null;

const displayedSkillContent = computed(() => skillContentMap[displayedSkill.value] || skillContentMap.B);

const pageNavLabel = computed(() => (activePage.value === 'settings' ? '翻到下一页' : '切回上一页'));

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

function clearDrawTimers() {
  if (drawRevealTimer !== null) {
    window.clearTimeout(drawRevealTimer);
    drawRevealTimer = null;
  }
  if (drawEndTimer !== null) {
    window.clearTimeout(drawEndTimer);
    drawEndTimer = null;
  }
}

function playFlip(nextSkill: SkillMode) {
  clearFlipTimers();
  isTurning.value = true;
  flipStartTimer = window.setTimeout(() => {
    displayedSkill.value = nextSkill;
    drawnCard.value = '';
    drawnCardIsHidden.value = false;
  }, 300);
  flipEndTimer = window.setTimeout(() => {
    isTurning.value = false;
  }, 400);
}

function togglePage() {
  activePage.value = activePage.value === 'settings' ? 'detail' : 'settings';
}

function drawTarotCard() {
  if (isDrawing.value) {
    return;
  }

  clearDrawTimers();
  isDrawing.value = true;
  drawnCard.value = '';
  drawnCardIsHidden.value = false;

  drawRevealTimer = window.setTimeout(() => {
    const result = tarotPool[Math.floor(Math.random() * tarotPool.length)];
    drawnCard.value = result;
    drawnCardIsHidden.value = result.includes('隐藏款');
  }, 400);

  drawEndTimer = window.setTimeout(() => {
    isDrawing.value = false;
  }, 800);
}

watch(
  () => props.storySettings.skill2,
  (nextSkill, previousSkill) => {
    const nextValue = nextSkill || 'B';
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
  clearDrawTimers();
});
</script>

<template>
  <section class="ellia-skill2-shell" :class="{ 'is-detail': activePage === 'detail' }">
    <button type="button" class="ellia-skill2-nav-btn ellia-skill2-nav-btn-left" @click="emit('back')">
      ← 返回索引
    </button>
    <button type="button" class="ellia-skill2-nav-btn ellia-skill2-nav-btn-right" @click="togglePage">
      {{ pageNavLabel }} →
    </button>

    <svg
      v-if="activePage === 'detail'"
      class="ellia-skill2-bg-watermark"
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

    <div class="ellia-skill2-inner-frame">
      <div class="ellia-skill2-frame-dot dot-tl"></div>
      <div class="ellia-skill2-frame-dot dot-tr"></div>
      <div class="ellia-skill2-frame-dot dot-bl"></div>
      <div class="ellia-skill2-frame-dot dot-br"></div>
    </div>

    <template v-if="activePage === 'settings'">
      <div class="ellia-skill2-pane ellia-skill2-pane-left">
        <div class="ellia-skill2-settings-title">SECOND SKILL SLOT</div>
        <div class="ellia-skill2-settings-options">
          <button
            v-for="option in skillOptionGroups.skill2"
            :key="option.value"
            type="button"
            class="ellia-skill2-settings-option"
            :class="{ 'is-active': storySettings.skill2 === option.value }"
            @click="emit('set-skill', 'skill2', option.value)"
          >
            {{ option.label }}
          </button>
        </div>

        <div class="ellia-skill2-divider"></div>

        <div class="ellia-skill2-settings-title">QUICK REPLY</div>
        <div class="ellia-skill2-settings-options">
          <button
            v-for="option in quickReplyOptionGroups.skill2"
            :key="option"
            type="button"
            class="ellia-skill2-settings-option ellia-skill2-quick-reply-btn"
            @click="emit('quick-reply', option)"
          >
            {{ option }}
          </button>
        </div>
      </div>

      <div class="ellia-skill2-pane ellia-skill2-pane-right">
        <div class="ellia-skill2-detail-title">命运塔罗</div>
        <div class="ellia-skill2-detail-subtitle">Tarot of Fate</div>

        <div class="ellia-skill2-drawn-card" :class="{ 'is-visible': drawnCard, 'is-hidden-card': drawnCardIsHidden }">
          {{ drawnCard || '[ 等待抽取 ]' }}
        </div>

        <button
          type="button"
          class="ellia-skill2-tarot-wrapper"
          :class="{ 'is-drawing': isDrawing }"
          @click="drawTarotCard"
        >
          <svg class="ellia-skill2-svg-tarot" viewBox="0 0 180 300" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ellia-skill2-card-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1b0e29" />
                <stop offset="50%" stop-color="#2a1640" />
                <stop offset="100%" stop-color="#0f0717" />
              </linearGradient>
              <radialGradient id="ellia-skill2-card-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#caa45d" stop-opacity="0.15" />
                <stop offset="100%" stop-color="transparent" stop-opacity="0" />
              </radialGradient>
            </defs>
            <rect
              x="5"
              y="5"
              width="170"
              height="290"
              rx="10"
              fill="url(#ellia-skill2-card-bg)"
              stroke="#11081a"
              stroke-width="2"
            />
            <rect x="5" y="5" width="170" height="290" rx="10" fill="url(#ellia-skill2-card-glow)" />
            <rect
              x="15"
              y="15"
              width="150"
              height="270"
              rx="6"
              fill="none"
              stroke="#caa45d"
              stroke-width="1.5"
              stroke-opacity="0.6"
            />
            <rect
              x="20"
              y="20"
              width="140"
              height="260"
              rx="4"
              fill="none"
              stroke="#caa45d"
              stroke-width="0.5"
              stroke-opacity="0.3"
              stroke-dasharray="3 3"
            />

            <g transform="translate(90, 150)">
              <circle cx="0" cy="0" r="40" fill="none" stroke="#caa45d" stroke-width="1" stroke-opacity="0.8" />
              <circle
                cx="0"
                cy="0"
                r="50"
                fill="none"
                stroke="#caa45d"
                stroke-width="0.5"
                stroke-opacity="0.3"
                stroke-dasharray="2 4"
              />
              <path
                d="M0,-55 L15,-15 L55,0 L15,15 L0,55 L-15,15 L-55,0 L-15,-15 Z"
                fill="none"
                stroke="#e5c7ff"
                stroke-width="0.5"
                stroke-opacity="0.5"
              />
              <path d="M-22,0 Q0,-18 22,0 Q0,18 -22,0 Z" fill="none" stroke="#caa45d" stroke-width="1.5" />
              <circle cx="0" cy="0" r="7" fill="#caa45d" opacity="0.8" />
              <circle cx="0" cy="0" r="2.5" fill="#1b0e29" />
            </g>

            <path
              d="M70,35 L90,25 L110,35 M90,25 L90,45"
              fill="none"
              stroke="#caa45d"
              stroke-width="1"
              stroke-opacity="0.5"
            />
            <path
              d="M70,265 L90,275 L110,265 M90,275 L90,255"
              fill="none"
              stroke="#caa45d"
              stroke-width="1"
              stroke-opacity="0.5"
            />
          </svg>
        </button>

        <div class="ellia-skill2-flip-card-container" :class="{ 'is-turning': isTurning }">
          <div class="ellia-skill2-flavor-text">
            {{ displayedSkillContent.flavor }}
          </div>

          <div class="ellia-skill2-ticket-detail-status">
            当前已启用 <span class="glow-text">{{ displayedSkillContent.status }}</span
            ><br />
            <span class="ellia-skill2-status-note">设定将保存为聊天变量供 EJS 读取</span>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="ellia-skill2-pane ellia-skill2-pane-left">
        <div class="ellia-skill2-intro-greeting">
          “哟！旅伴~准备好继续前行了吗？”<br /><br />
          <span>这里记录的是有关于“推演”和“足迹”的可能性。只要您不停下脚步，属于您的故事就远没有结束哦。</span>
        </div>

        <div class="ellia-skill2-section-title">
          <svg viewBox="0 0 24 24">
            <polygon points="12 2 15 10 23 12 15 14 12 22 9 14 1 12 9 10" />
          </svg>
          命轨的干涉 (INTERVENTION)
        </div>

        <div class="ellia-skill2-mechanic-item">
          <div class="ellia-skill2-mechanic-title">不止于此</div>
          <div class="ellia-skill2-mechanic-desc">
            旅途总有新的分岔口。当您完成某段任务时，我会为您已掌握的能力推演出全新的进化可能。别轻易满足哦，您的潜力，可远不止于此~
          </div>
        </div>
      </div>

      <div class="ellia-skill2-pane ellia-skill2-pane-right ellia-skill2-pane-right-detail">
        <div class="ellia-skill2-section-title">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" stroke-dasharray="4 4" />
            <circle cx="12" cy="12" r="3" fill="#caa45d" />
          </svg>
          星海的足迹 (JOURNEY)
        </div>

        <div class="ellia-skill2-mechanic-item">
          <div class="ellia-skill2-mechanic-title quick">步履不停</div>
          <div class="ellia-skill2-mechanic-desc">
            您走过的每一步都不会毫无意义。当一段任务告一段落，您行动的轨迹会化作“空白足迹”的碎片留存。毕竟，走过的路，才是属于您的故事嘛。
          </div>
        </div>

        <div class="ellia-skill2-mechanic-item">
          <div class="ellia-skill2-mechanic-title quick">瓮、星屑、步伐</div>
          <div class="ellia-skill2-mechanic-desc">
            收集到足够的手账部件了吗？只需消耗些许命运点数（FP），只要您说出“拼缀”我便能将那些散落的足迹与情绪拼缀起来，提取其中的意象，为您编织出全新的奇迹与馈赠。
          </div>
        </div>

        <div class="ellia-skill2-lore-footer">
          [ 观测指南 ]<br />
          您拨动的每一条命运丝线，都会化作无形的符文被底层秩序（EJS变量）默默记住。
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped lang="scss">
.ellia-skill2-shell {
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

.ellia-skill2-shell.is-detail {
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.9),
    inset 0 0 60px rgba(202, 164, 93, 0.05);
}

.ellia-skill2-nav-btn {
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

.ellia-skill2-nav-btn:hover {
  color: #caa45d;
  text-shadow: 0 0 8px rgba(202, 164, 93, 0.6);
}

.ellia-skill2-nav-btn-left {
  left: 2.5rem;
}

.ellia-skill2-nav-btn-right {
  right: 2.5rem;
}

.ellia-skill2-nav-btn-left:hover {
  transform: translateX(-4px);
}

.ellia-skill2-nav-btn-right:hover {
  transform: translateX(4px);
}

.ellia-skill2-bg-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 0;
  width: 120%;
  height: 120%;
  opacity: 0.06;
  pointer-events: none;
  animation: ellia-skill2-watermark-rotate 120s linear infinite;
}

.ellia-skill2-inner-frame {
  position: absolute;
  inset: 14px;
  z-index: 10;
  border: 1px solid rgba(202, 164, 93, 0.25);
  pointer-events: none;
}

.ellia-skill2-frame-dot {
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

.ellia-skill2-pane {
  position: relative;
  z-index: 5;
  flex: 1;
  margin-top: 0.5rem;
}

.ellia-skill2-pane-left {
  padding-right: 1.5rem;
}

.ellia-skill2-pane-left::after {
  content: '';
  position: absolute;
  top: 5%;
  right: -1.5rem;
  bottom: 5%;
  width: 1px;
  background: linear-gradient(to bottom, transparent, rgba(224, 176, 255, 0.25), transparent);
}

.ellia-skill2-pane-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-left: 1.5rem;
  perspective: 1200px;
}

.ellia-skill2-pane-right-detail {
  align-items: stretch;
  justify-content: flex-start;
}

.ellia-skill2-settings-title {
  margin-bottom: 1.2rem;
  color: rgba(202, 164, 93, 0.7);
  font-size: 0.8rem;
  letter-spacing: 0.3em;
  text-align: center;
}

.ellia-skill2-settings-options {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.ellia-skill2-settings-option {
  position: relative;
  z-index: 20;
  padding: 0.8rem 1rem;
  border: none;
  border-bottom: 1px solid rgba(224, 176, 255, 0.05);
  background: transparent;
  color: rgba(240, 220, 252, 0.6);
  font-family: inherit;
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ellia-skill2-settings-option:hover {
  border-bottom-color: rgba(224, 176, 255, 0.3);
  color: #fff;
  text-shadow: 0 0 10px rgba(224, 176, 255, 0.8);
}

.ellia-skill2-settings-option.is-active {
  border-bottom: 1px solid rgba(202, 164, 93, 0.5);
  background: radial-gradient(ellipse at bottom, rgba(202, 164, 93, 0.15) 0%, transparent 60%);
  color: #caa45d;
  text-shadow: 0 0 15px rgba(202, 164, 93, 0.6);
}

.ellia-skill2-settings-option.is-active::before {
  content: '✦ ';
  margin-right: 4px;
  font-size: 0.75rem;
}

.ellia-skill2-settings-option.is-active::after {
  content: ' ✦';
  margin-left: 4px;
  font-size: 0.75rem;
}

.ellia-skill2-quick-reply-btn:active {
  background: rgba(224, 176, 255, 0.1);
}

.ellia-skill2-divider {
  width: 100%;
  height: 1px;
  margin: 2rem 0;
  background: linear-gradient(90deg, transparent, rgba(224, 176, 255, 0.25), transparent);
}

.ellia-skill2-detail-title {
  margin-bottom: 0.2rem;
  color: #caa45d;
  font-size: 1.2rem;
  letter-spacing: 0.2em;
  text-align: center;
  text-shadow: 0 0 12px rgba(202, 164, 93, 0.4);
}

.ellia-skill2-detail-subtitle {
  margin-bottom: 1rem;
  color: rgba(224, 176, 255, 0.5);
  font-size: 0.65rem;
  letter-spacing: 0.4em;
  text-transform: uppercase;
}

.ellia-skill2-drawn-card {
  min-height: 28px;
  margin-bottom: 1rem;
  color: #ffeba1;
  font-size: 1.15rem;
  font-weight: bold;
  letter-spacing: 0.1em;
  text-align: center;
  text-shadow: 0 0 12px rgba(202, 164, 93, 0.8);
  opacity: 0;
  transition:
    opacity 0.4s ease,
    color 0.4s ease,
    text-shadow 0.4s ease;
}

.ellia-skill2-drawn-card.is-visible {
  opacity: 1;
}

.ellia-skill2-drawn-card.is-hidden-card {
  color: #ffb6c1;
  text-shadow: 0 0 12px rgba(255, 105, 180, 0.8);
}

.ellia-skill2-tarot-wrapper {
  position: relative;
  z-index: 20;
  width: 120px;
  height: 200px;
  margin-bottom: 1.2rem;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform 0.4s ease;
}

.ellia-skill2-tarot-wrapper:hover {
  transform: translateY(-4px);
}

.ellia-skill2-tarot-wrapper.is-drawing {
  animation: ellia-skill2-elegant-draw 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.ellia-skill2-svg-tarot {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.6));
}

.ellia-skill2-flip-card-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  transform-style: preserve-3d;
  transition:
    transform 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.4s ease;
}

.ellia-skill2-flip-card-container.is-turning {
  opacity: 0;
  transform: rotateX(90deg) scale(0.95);
}

.ellia-skill2-flavor-text {
  min-height: 24px;
  margin-bottom: 1rem;
  color: #e0b0ff;
  font-size: 1rem;
  letter-spacing: 0.1em;
  text-align: center;
  text-shadow: 0 0 8px rgba(155, 89, 182, 0.6);
}

.ellia-skill2-ticket-detail-status {
  width: 90%;
  padding-top: 1rem;
  border-top: 1px solid rgba(202, 164, 93, 0.3);
  color: #f1dcff;
  font-size: 0.8rem;
  line-height: 1.8;
  text-align: center;
}

.ellia-skill2-ticket-detail-status .glow-text {
  padding: 0 4px;
  color: #caa45d;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(202, 164, 93, 0.8);
}

.ellia-skill2-status-note {
  opacity: 0.4;
  font-size: 0.7rem;
}

.ellia-skill2-intro-greeting {
  position: relative;
  margin-bottom: 2rem;
  color: #e0b0ff;
  font-size: 0.95rem;
  line-height: 1.8;
  letter-spacing: 0.05em;
  text-align: justify;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
}

.ellia-skill2-intro-greeting span {
  color: #caa45d;
  opacity: 0.9;
}

.ellia-skill2-section-title {
  display: flex;
  align-items: center;
  margin-bottom: 1.2rem;
  color: #caa45d;
  font-size: 0.9rem;
  letter-spacing: 0.2em;
  text-shadow: 0 0 10px rgba(202, 164, 93, 0.4);
}

.ellia-skill2-section-title svg {
  width: 14px;
  height: 14px;
  margin-right: 8px;
  fill: none;
  stroke: #caa45d;
  stroke-width: 1.5;
}

.ellia-skill2-mechanic-item {
  margin-bottom: 1.5rem;
}

.ellia-skill2-mechanic-title {
  display: flex;
  align-items: center;
  margin-bottom: 0.4rem;
  color: #f1dcff;
  font-size: 0.95rem;
  font-weight: 600;
  text-shadow: 0 0 5px rgba(155, 89, 182, 0.5);
}

.ellia-skill2-mechanic-title::before {
  content: '✦';
  margin-right: 6px;
  color: #caa45d;
  font-size: 0.7rem;
}

.ellia-skill2-mechanic-title.quick::before {
  content: '✧';
  color: #e0b0ff;
}

.ellia-skill2-mechanic-desc {
  padding-left: 1.2rem;
  color: rgba(220, 200, 255, 0.7);
  font-size: 0.85rem;
  line-height: 1.8;
  text-align: justify;
}

.ellia-skill2-lore-footer {
  margin-top: auto;
  padding-top: 1.2rem;
  border-top: 1px dashed rgba(202, 164, 93, 0.2);
  color: rgba(202, 164, 93, 0.6);
  font-size: 0.75rem;
  line-height: 1.6;
  letter-spacing: 0.1em;
  text-align: center;
}

:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-skill2-nav-btn),
:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-skill2-settings-option),
:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-skill2-tarot-wrapper),
:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-skill2-drawn-card),
:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-skill2-flip-card-container) {
  transition: none !important;
}

:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-skill2-bg-watermark),
:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-skill2-tarot-wrapper.is-drawing) {
  animation: none !important;
}

@keyframes ellia-skill2-elegant-draw {
  0% {
    transform: translateY(0) rotateY(0deg);
  }
  50% {
    transform: translateY(-15px) rotateY(180deg) scale(1.02);
  }
  100% {
    transform: translateY(0) rotateY(360deg) scale(1);
  }
}

@keyframes ellia-skill2-watermark-rotate {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@media (max-width: 900px) {
  .ellia-skill2-shell {
    flex-direction: column;
    gap: 1.5rem;
    min-height: auto;
    padding: 3.2rem 1.4rem 1.4rem;
  }

  .ellia-skill2-pane-left,
  .ellia-skill2-pane-right {
    padding: 0;
  }

  .ellia-skill2-pane-left::after {
    display: none;
  }
}

@media (max-width: 640px) {
  .ellia-skill2-shell {
    padding: 3rem 1rem 1rem;
  }

  .ellia-skill2-nav-btn {
    font-size: 0.72rem;
  }

  .ellia-skill2-nav-btn-left {
    left: 1rem;
  }

  .ellia-skill2-nav-btn-right {
    right: 1rem;
  }

  .ellia-skill2-settings-option {
    padding: 0.72rem 0.8rem;
    font-size: 0.88rem;
  }

  .ellia-skill2-detail-title {
    font-size: 1.05rem;
  }

  .ellia-skill2-flavor-text {
    font-size: 0.92rem;
  }
}
</style>
