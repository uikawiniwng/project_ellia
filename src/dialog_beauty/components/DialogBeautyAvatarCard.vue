<script setup lang="ts">
import { computed, ref } from 'vue';
import { DEFAULT_MOOD, MOOD_AVATAR_MAP } from '../constants';
import type { ElliaCard } from '../types';

const props = defineProps<{
  card: ElliaCard;
}>();

const avatarEntry = computed(() => {
  const mood = props.card.mood ?? DEFAULT_MOOD;
  return MOOD_AVATAR_MAP[mood] ?? MOOD_AVATAR_MAP[DEFAULT_MOOD]!;
});

const avatarSrc = ref('');

const resolvedAvatarSrc = computed(() => {
  if (avatarSrc.value) {
    return avatarSrc.value;
  }

  return avatarEntry.value.primaryUrl;
});

function handleAvatarError() {
  if (avatarSrc.value !== avatarEntry.value.fallbackUrl) {
    avatarSrc.value = avatarEntry.value.fallbackUrl;
  }
}

// 当 mood 变化时重置 avatarSrc 以重新尝试 primary
// (通过 computed 的 avatarEntry 自动响应 mood 变化)
</script>

<template>
  <div class="ellia-avatar-box" :data-mood="card.mood ?? 'smile'">
    <!-- 背景 SVG -->
    <svg class="ellia-avatar-box-bg" preserveAspectRatio="none" viewBox="0 0 100 100">
      <rect x="0" y="0" width="100" height="100" fill="#0d0912" stroke="rgba(180, 140, 220, 0.3)" stroke-width="1" />
      <path d="M0,5 L5,0 M95,0 L100,5 M100,95 L95,100 M5,100 L0,95" stroke="#b48cdc" stroke-width="1" fill="none" />
    </svg>

    <!-- 头像区域 -->
    <div class="ellia-avatar-wrap">
      <div class="ellia-avatar-bg">
        <svg viewBox="0 0 100 100" class="ellia-avatar-magic-circle">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="rgba(180, 140, 220, 0.4)"
            stroke-width="0.5"
            stroke-dasharray="2 2"
          />
          <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(180, 140, 220, 0.3)" stroke-width="0.5" />
          <polygon points="50,8 88,74 12,74" fill="none" stroke="rgba(180, 140, 220, 0.2)" stroke-width="0.5" />
          <polygon points="50,92 88,26 12,26" fill="none" stroke="rgba(180, 140, 220, 0.2)" stroke-width="0.5" />
        </svg>
      </div>
      <div class="ellia-avatar-inner">
        <img class="ellia-avatar-img" :src="resolvedAvatarSrc" :alt="card.name" @error="handleAvatarError" />
      </div>
      <svg class="ellia-avatar-frame-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect x="2" y="2" width="96" height="96" fill="none" stroke="#b48cdc" stroke-width="1" opacity="0.5" />
        <path d="M0,6 L6,0 M94,0 L100,6 M100,94 L94,100 M6,100 L0,94" stroke="#b48cdc" stroke-width="1.5" fill="none" />
      </svg>
    </div>

    <!-- 内容区域 -->
    <div class="ellia-avatar-content">
      <div class="ellia-avatar-header">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="#b48cdc">
          <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
        </svg>
        <span class="ellia-avatar-name">{{ card.name }}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="#b48cdc">
          <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
        </svg>
        <div class="ellia-avatar-header-line"></div>
      </div>

      <!-- 对话内容区域 - 保留 ellia-v2-line / ellia-v2-action / ellia-v2-char class 以复用 typewriter.ts -->
      <div class="ellia-avatar-text">
        <div v-for="(line, index) in card.lines" :key="`${card.id}-${line.type}-${index}`" class="ellia-v2-line">
          <span v-if="line.type === 'action'" class="ellia-v2-action">{{ line.text }}</span>
          <template v-else>{{ line.text }}</template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ellia-avatar-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 0 5px;
  padding: 10px;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  font-family: var(--ellia-body-font);
  clear: both;
}

.ellia-avatar-box-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.ellia-avatar-wrap {
  position: relative;
  width: 64px;
  height: 90px;
  flex-shrink: 0;
  z-index: 1;
  background: #000;
}

.ellia-avatar-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, #3a2556 0%, #0d0912 100%);
  overflow: hidden;
}

.ellia-avatar-magic-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140%;
  height: 140%;
  animation: ellia-avatar-spin 30s linear infinite;
}

@keyframes ellia-avatar-spin {
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.ellia-avatar-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.ellia-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
}

.ellia-avatar-frame-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
}

.ellia-avatar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  z-index: 1;
  padding-top: 2px;
}

.ellia-avatar-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.ellia-avatar-name {
  font-family: 'Times New Roman', serif;
  font-size: 13px;
  color: #d4b8ff;
  font-weight: bold;
  letter-spacing: 1px;
}

.ellia-avatar-header-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(180, 140, 220, 0.4), transparent);
}

.ellia-avatar-text {
  font-size: 14px;
  color: #e6dcf5;
  line-height: 1.6;
  text-align: justify;
  display: flex;
  flex-direction: column;
  gap: 0.2em;
}

// 保留与 typewriter.ts 兼容的 class
:deep(.ellia-v2-line) {
  min-height: 1.6em;
  white-space: pre-wrap;
  word-break: break-word;
}

:deep(.ellia-v2-action) {
  color: #e09fe3;
}

:deep(.ellia-v2-char) {
  opacity: 0;
  display: inline-block;
}

:deep(.ellia-v2-char.is-first-char) {
  font-size: 1.3em;
  color: #d4b8ff;
  margin-right: 2px;
  font-family: 'Cinzel', serif;
  text-shadow: 0 0 5px rgba(180, 140, 220, 0.6);
}

// 禁用动画时的样式覆盖
:global(.ellia-v2-root[data-animations-enabled='false']) .ellia-avatar-magic-circle {
  animation: none !important;
}

@media (max-width: 640px) {
  .ellia-avatar-wrap {
    width: 52px;
    height: 72px;
  }

  .ellia-avatar-name {
    font-size: 12px;
  }

  .ellia-avatar-text {
    font-size: 13px;
  }
}
</style>
