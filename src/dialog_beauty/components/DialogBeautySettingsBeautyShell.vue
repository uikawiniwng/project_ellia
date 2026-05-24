<script setup lang="ts">
import { ref } from 'vue';
import { fontOptions, typewriterSpeedOptions } from '../constants';
import type { DialogBeautyUiSettings, FontMode, TypewriterSpeed } from '../types';

defineProps<{
  uiSettings: DialogBeautyUiSettings;
}>();

const emit = defineEmits<{
  (event: 'back'): void;
  (event: 'set-font-mode', mode: FontMode): void;
  (event: 'set-animation-enabled', enabled: boolean): void;
  (event: 'set-typewriter-speed', speed: TypewriterSpeed): void;
}>();

const isCuriousAboutFace = ref(false);
</script>

<template>
  <section class="ellia-beauty-shell">
    <button type="button" class="ellia-beauty-nav-btn ellia-beauty-nav-btn-left" @click="emit('back')">
      ← 返回索引
    </button>
    <button
      type="button"
      class="ellia-beauty-nav-btn ellia-beauty-nav-btn-right"
      @click="isCuriousAboutFace = !isCuriousAboutFace"
    >
      切换到下一页？
    </button>

    <div class="ellia-beauty-inner-frame">
      <div class="ellia-beauty-frame-dot dot-tl"></div>
      <div class="ellia-beauty-frame-dot dot-tr"></div>
      <div class="ellia-beauty-frame-dot dot-bl"></div>
      <div class="ellia-beauty-frame-dot dot-br"></div>
    </div>

    <div class="ellia-beauty-pane-left">
      <div class="ellia-beauty-greeting">
        “哟！旅伴~这是最后的调整咯。<br />
        虽然弄了个类似碟仙的游标，但我可不想再玩什么占卜游戏了。这只是为了维持我们“通讯”的小信标罢了。快看看还有什么需要顺手调一下的吧？”
      </div>

      <div class="ellia-beauty-settings-group">
        <div class="ellia-beauty-settings-title">FONT STYLE / 字体</div>
        <div class="ellia-beauty-settings-options">
          <button
            v-for="option in fontOptions"
            :key="option.value"
            type="button"
            class="ellia-beauty-settings-option"
            :class="{ 'is-active': uiSettings.fontMode === option.value }"
            @click="emit('set-font-mode', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="ellia-beauty-settings-group">
        <div class="ellia-beauty-settings-title">ENVIRONMENT ANIMATION / 环境动画</div>
        <div class="ellia-beauty-settings-options">
          <button
            type="button"
            class="ellia-beauty-settings-option"
            :class="{ 'is-active': uiSettings.animationEnabled }"
            @click="emit('set-animation-enabled', true)"
          >
            On
          </button>
          <button
            type="button"
            class="ellia-beauty-settings-option"
            :class="{ 'is-active': !uiSettings.animationEnabled }"
            @click="emit('set-animation-enabled', false)"
          >
            Off
          </button>
        </div>
      </div>

      <div class="ellia-beauty-settings-group">
        <div class="ellia-beauty-settings-title">TYPING SPEED / 打字速度</div>
        <div class="ellia-beauty-settings-options">
          <button
            v-for="option in typewriterSpeedOptions"
            :key="option.value"
            type="button"
            class="ellia-beauty-settings-option"
            :class="{ 'is-active': uiSettings.typewriterSpeed === option.value }"
            @click="emit('set-typewriter-speed', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="ellia-beauty-settings-group ellia-beauty-face-group">
        <div class="ellia-beauty-settings-title title-curious">“您难道好奇我的面容？”</div>
        <div class="ellia-beauty-settings-options">
          <button
            type="button"
            class="ellia-beauty-settings-option"
            :class="{ 'is-active': isCuriousAboutFace }"
            @click="isCuriousAboutFace = true"
          >
            是
          </button>
          <button
            type="button"
            class="ellia-beauty-settings-option"
            :class="{ 'is-active': !isCuriousAboutFace }"
            @click="isCuriousAboutFace = false"
          >
            不是
          </button>
        </div>
      </div>
    </div>

    <div class="ellia-beauty-pane-right">
      <div class="ellia-beauty-detail-title">跨界信标</div>
      <div class="ellia-beauty-detail-subtitle">SPIRIT ANCHOR</div>

      <div class="ellia-beauty-planchette-wrapper">
        <svg class="ellia-beauty-svg-planchette" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="ellia-beauty-planchette-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#caa45d" stop-opacity="0.2" />
              <stop offset="100%" stop-color="transparent" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="ellia-beauty-planchette-body" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#140a20" />
              <stop offset="100%" stop-color="#2a1640" />
            </linearGradient>
          </defs>

          <circle cx="100" cy="120" r="90" fill="url(#ellia-beauty-planchette-glow)" />

          <g transform="translate(0, 10)">
            <path
              d="M 100 10 C 140 70, 180 130, 170 180 C 160 210, 40 210, 30 180 C 20 130, 60 70, 100 10 Z"
              fill="url(#ellia-beauty-planchette-body)"
              stroke="#caa45d"
              stroke-width="2"
              stroke-opacity="0.8"
            />

            <path
              d="M 100 20 C 135 75, 170 130, 162 175 C 153 200, 47 200, 38 175 C 30 130, 65 75, 100 20 Z"
              fill="none"
              stroke="#caa45d"
              stroke-width="0.5"
              stroke-opacity="0.4"
              stroke-dasharray="3 3"
            />

            <path
              d="M 50 150 L 60 160 M 150 150 L 140 160 M 100 180 L 100 190"
              stroke="#caa45d"
              stroke-opacity="0.5"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <circle cx="100" cy="40" r="2" fill="#caa45d" />

            <circle cx="100" cy="110" r="30" fill="#0a0310" stroke="#caa45d" stroke-width="1.5" />
            <circle cx="100" cy="110" r="38" fill="none" stroke="#caa45d" stroke-width="0.5" stroke-dasharray="2 4" />

            <path d="M 80 110 Q 100 95 120 110 Q 100 125 80 110 Z" fill="none" stroke="#e0b0ff" stroke-width="1.5" />
            <circle cx="100" cy="110" r="6" fill="#e0b0ff" filter="drop-shadow(0 0 5px #e0b0ff)" />
          </g>
        </svg>
      </div>

      <div class="ellia-beauty-flavor-text">
        「 跨越维度的锚点，只为您传递真实 」<br />
        <span>它不再预示未来，只会安静地注视着您。</span>
      </div>

      <div class="ellia-beauty-ticket-detail-status">
        基础设置已就绪<br />
        <span>所有选项均已同步至底层环境</span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.ellia-beauty-shell {
  position: relative;
  display: flex;
  gap: 2rem;
  width: 100%;
  min-height: 500px;
  padding: 3rem 2.5rem 2rem;
  border: 1px solid rgba(155, 89, 182, 0.2);
  border-radius: 4px;
  background: rgba(15, 8, 22, 0.85);
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.9),
    inset 0 0 60px rgba(202, 164, 93, 0.03);
  backdrop-filter: blur(12px);
  overflow: hidden;
}

.ellia-beauty-inner-frame {
  position: absolute;
  inset: 14px;
  z-index: 10;
  border: 1px solid rgba(202, 164, 93, 0.25);
  pointer-events: none;
}

.ellia-beauty-frame-dot {
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

.ellia-beauty-nav-btn {
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

.ellia-beauty-nav-btn:hover {
  color: #caa45d;
  text-shadow: 0 0 8px rgba(202, 164, 93, 0.6);
}

.ellia-beauty-nav-btn-left {
  left: 2.5rem;
}

.ellia-beauty-nav-btn-right {
  right: 2.5rem;
}

.ellia-beauty-nav-btn-left:hover {
  transform: translateX(-4px);
}

.ellia-beauty-nav-btn-right:hover {
  transform: translateX(4px);
}

.ellia-beauty-pane-left {
  position: relative;
  z-index: 5;
  display: flex;
  flex: 1.1;
  flex-direction: column;
  gap: 1.2rem;
  margin-top: 1rem;
  padding-right: 2rem;
}

.ellia-beauty-pane-left::after {
  content: '';
  position: absolute;
  top: 2%;
  right: -1rem;
  bottom: 2%;
  width: 1px;
  background: linear-gradient(to bottom, transparent, rgba(224, 176, 255, 0.25), transparent);
}

.ellia-beauty-pane-right {
  position: relative;
  z-index: 5;
  display: flex;
  flex: 0.9;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  padding-left: 1rem;
}

.ellia-beauty-greeting {
  margin-bottom: 0.5rem;
  color: #e0b0ff;
  font-size: 0.85rem;
  line-height: 1.6;
  text-align: justify;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
}

.ellia-beauty-settings-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ellia-beauty-face-group {
  margin-top: 0.5rem;
}

.ellia-beauty-settings-title {
  color: rgba(202, 164, 93, 0.7);
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.ellia-beauty-settings-title.title-curious {
  color: #e0b0ff;
  letter-spacing: 0.1em;
  text-transform: none;
}

.ellia-beauty-settings-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  width: 100%;
}

.ellia-beauty-settings-option {
  position: relative;
  z-index: 20;
  flex: 1 1 auto;
  padding: 0.6rem 0.5rem;
  border: none;
  border-bottom: 1px solid rgba(224, 176, 255, 0.05);
  background: transparent;
  color: rgba(240, 220, 252, 0.5);
  font-family: inherit;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ellia-beauty-settings-option:hover {
  border-bottom-color: rgba(224, 176, 255, 0.3);
  color: #fff;
  text-shadow: 0 0 10px rgba(224, 176, 255, 0.8);
}

.ellia-beauty-settings-option.is-active {
  border-bottom: 1px solid rgba(202, 164, 93, 0.5);
  background: radial-gradient(ellipse at bottom, rgba(202, 164, 93, 0.15) 0%, transparent 60%);
  color: #caa45d;
  text-shadow: 0 0 15px rgba(202, 164, 93, 0.6);
}

.ellia-beauty-settings-option.is-active::before {
  content: '✦ ';
  margin-right: 4px;
  font-size: 0.7rem;
}

.ellia-beauty-settings-option.is-active::after {
  content: ' ✦';
  margin-left: 4px;
  font-size: 0.7rem;
}

.ellia-beauty-planchette-wrapper {
  position: relative;
  z-index: 20;
  width: 160px;
  height: 200px;
  margin-bottom: 1.5rem;
  animation: ellia-beauty-mystic-float 6s ease-in-out infinite;
}

.ellia-beauty-svg-planchette {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.8));
}

.ellia-beauty-detail-title {
  margin-bottom: 0.2rem;
  color: #caa45d;
  font-size: 1.2rem;
  letter-spacing: 0.2em;
  text-align: center;
  text-shadow: 0 0 12px rgba(202, 164, 93, 0.4);
}

.ellia-beauty-detail-subtitle {
  margin-bottom: 2rem;
  color: rgba(224, 176, 255, 0.5);
  font-size: 0.65rem;
  letter-spacing: 0.4em;
  text-transform: uppercase;
}

.ellia-beauty-flavor-text {
  margin-top: 1rem;
  color: #e0b0ff;
  font-size: 0.9rem;
  line-height: 1.6;
  letter-spacing: 0.1em;
  text-align: center;
  text-shadow: 0 0 8px rgba(155, 89, 182, 0.6);
}

.ellia-beauty-flavor-text span,
.ellia-beauty-ticket-detail-status span {
  color: rgba(224, 176, 255, 0.4);
  font-size: 0.75rem;
}

.ellia-beauty-ticket-detail-status {
  width: 90%;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(202, 164, 93, 0.3);
  color: #f1dcff;
  font-size: 0.75rem;
  line-height: 1.8;
  text-align: center;
}

:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-beauty-nav-btn),
:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-beauty-settings-option) {
  transition: none !important;
}

:global(.ellia-v2-root[data-animations-enabled='false'] .ellia-beauty-planchette-wrapper) {
  animation: none !important;
}

@keyframes ellia-beauty-mystic-float {
  0% {
    filter: none;
    transform: translateY(0) rotate(0deg);
  }
  50% {
    filter: drop-shadow(0 10px 15px rgba(202, 164, 93, 0.2));
    transform: translateY(-10px) rotate(2deg);
  }
  100% {
    filter: none;
    transform: translateY(0) rotate(0deg);
  }
}

@media (max-width: 900px) {
  .ellia-beauty-shell {
    flex-direction: column;
    gap: 1.5rem;
    min-height: auto;
    padding: 3.2rem 1.4rem 1.4rem;
  }

  .ellia-beauty-pane-left,
  .ellia-beauty-pane-right {
    flex: 1;
    padding: 0;
  }

  .ellia-beauty-pane-left::after {
    display: none;
  }
}

@media (max-width: 640px) {
  .ellia-beauty-shell {
    padding: 3rem 1rem 1rem;
  }

  .ellia-beauty-nav-btn {
    font-size: 0.72rem;
  }

  .ellia-beauty-nav-btn-left {
    left: 1rem;
  }

  .ellia-beauty-nav-btn-right {
    right: 1rem;
  }
}
</style>
