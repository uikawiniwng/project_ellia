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

      <div v-if="isSettingsOpen(card.id)" class="ellia-v2-settings-host">
        <div class="ellia-v2-settings-modal">
          <div class="ellia-v2-settings-modal-topbar">
            <div class="ellia-v2-settings-heading">
              <span class="ellia-v2-settings-title-main">Dialog Beauty</span>
              <span class="ellia-v2-settings-title-sub">v1.0.3 · 0509 · 设置会实时保存</span>
            </div>
            <button class="ellia-v2-settings-close" type="button" @click="closeSettingsPanel">✕</button>
          </div>

          <section class="ellia-v2-settings-section">
            <div class="ellia-v2-settings-title">字体</div>
            <div class="ellia-v2-settings-options">
              <button
                v-for="option in fontOptions"
                :key="option.value"
                type="button"
                class="ellia-v2-settings-option"
                :class="{ 'is-active': uiSettings.fontMode === option.value }"
                @click="setFontMode(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </section>

          <section class="ellia-v2-settings-section">
            <div class="ellia-v2-settings-title">型态</div>
            <div class="ellia-v2-settings-options">
              <button
                v-for="option in formTypeOptions"
                :key="option.value"
                type="button"
                class="ellia-v2-settings-option"
                :class="{ 'is-active': storySettings.formType === option.value }"
                @click="setFormType(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </section>

          <section class="ellia-v2-settings-section">
            <div class="ellia-v2-settings-title">技能1</div>
            <div class="ellia-v2-settings-options">
              <button
                v-for="option in skillOptionGroups.skill1"
                :key="`skill1-${option.value}`"
                type="button"
                class="ellia-v2-settings-option"
                :class="{ 'is-active': storySettings.skill1 === option.value }"
                @click="setSkill('skill1', option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </section>

          <section class="ellia-v2-settings-section">
            <div class="ellia-v2-settings-title">技能2</div>
            <div class="ellia-v2-settings-options">
              <button
                v-for="option in skillOptionGroups.skill2"
                :key="`skill2-${option.value}`"
                type="button"
                class="ellia-v2-settings-option"
                :class="{ 'is-active': storySettings.skill2 === option.value }"
                @click="setSkill('skill2', option.value)"
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
                @click="setSkill('skill3', option.value)"
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
                @click="setStoryStyle('WORLD')"
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
                @click="setStoryStyle(option.value)"
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
                @click="openStoryStyleDiy"
              >
                自定义
              </button>
            </div>
            <div v-if="storyStyleDiyStatus && !isStoryStyleDiyOpen" class="ellia-v2-settings-status">
              {{ storyStyleDiyStatus }}
            </div>
            <div v-if="isStoryStyleDiyOpen" class="ellia-v2-story-style-diy">
              <textarea
                v-model="storyStyleDiyDraft"
                class="ellia-v2-story-style-input"
                rows="3"
                placeholder="输入你想要的自定义故事风格"
              ></textarea>
              <div class="ellia-v2-settings-options">
                <button type="button" class="ellia-v2-settings-option" @click="saveStoryStyleDiy">传送</button>
                <button type="button" class="ellia-v2-settings-option" @click="requestStoryStyleSuggestion">
                  帮我想/优化！
                </button>
                <button type="button" class="ellia-v2-settings-option" @click="closeStoryStyleDiy">取消</button>
              </div>
              <div v-if="storyStyleDiyStatus" class="ellia-v2-settings-status">{{ storyStyleDiyStatus }}</div>
            </div>
          </section>

          <section class="ellia-v2-settings-section">
            <div class="ellia-v2-settings-title">环境动画</div>
            <div class="ellia-v2-settings-options">
              <button
                type="button"
                class="ellia-v2-settings-option"
                :class="{ 'is-active': uiSettings.animationEnabled }"
                @click="setAnimationEnabled(true)"
              >
                On
              </button>
              <button
                type="button"
                class="ellia-v2-settings-option"
                :class="{ 'is-active': !uiSettings.animationEnabled }"
                @click="setAnimationEnabled(false)"
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
                @click="setTypewriterSpeed(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </section>

          <div class="ellia-v2-settings-note">
            <div>字体 / 动画 / 打字速度：保存到全局变量</div>
            <div>型态 / 技能 / 故事风格：保存到聊天变量，供后续 EJS / 世界书读取</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';
import type { ComponentPublicInstance } from 'vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

interface ParsedLine {
  type: 'dialogue' | 'action';
  text: string;
}

interface ElliaCard {
  id: string;
  name: string;
  lines: ParsedLine[];
  hasPlayed: boolean;
  isAnimating: boolean;
  canReplay: boolean;
  isVisible: boolean;
}

type TokenKind = 'plain' | 'ellipsis' | 'comma' | 'period' | 'question' | 'exclaim' | 'colon' | 'phrase';
type FontMode = 'A' | 'B' | 'C' | 'D' | 'E';
type FormType = 'A' | 'B' | 'C';
type SkillMode = 'B' | 'C';
type StoryStyleMode = 'WORLD' | 'HAPPY_ADVENTURE' | 'JAPANESE_SHONEN' | 'WEIRD_GHOST' | 'SLICE_OF_LIFE' | 'CUSTOM';
type TypewriterSpeed = 'disable' | 'normal' | 'fast';
type StorySkillKey = 'skill1' | 'skill2' | 'skill3';

interface LineToken {
  kind: TokenKind;
  text: string;
}

interface PreparedChar {
  element: HTMLElement;
  char: string;
}

interface PreparedLine {
  type: ParsedLine['type'];
  text: string;
  chars: PreparedChar[];
}

interface RevealOptions {
  duration?: number;
  advance?: number;
  hold?: number;
  fromY?: number;
  fromScale?: number;
  ease?: string;
}

interface ElliaInstanceRegistryEntry {
  signature: string;
  assignments: Record<string, number>;
}

interface DialogBeautyUiSettings {
  fontMode: FontMode;
  animationEnabled: boolean;
  typewriterSpeed: TypewriterSpeed;
}

interface DialogBeautyStorySettings {
  formType: FormType;
  skill1: SkillMode;
  skill2: SkillMode;
  skill3: SkillMode;
  skill4: StoryStyleMode;
  skill4Custom: string;
  skill4Request: boolean;
}

interface RhythmProfile {
  baseAdvance: number;
  actionAdvance: number;
  lineGap: number;
  punctuation: {
    comma: number;
    period: number;
    question: number;
    exclaim: number;
    colon: number;
  };
  ellipsis: {
    dotAdvance: number;
    dotDuration: number;
    dotHold: number;
    tailPause: number;
    dotFromY: number;
    dotFromScale: number;
  };
  phrase: {
    slowLeadAdvance: number;
    slowLeadDuration: number;
    slowLeadHold: number;
    fastLeadAdvance: number;
    fastLeadDuration: number;
    softAdvance: number;
    softDuration: number;
    tailPause: number;
    particleTailPause: number;
  };
}

const BASE_RHYTHM: RhythmProfile = {
  baseAdvance: 0.032,
  actionAdvance: 0.032,
  lineGap: 0.08,
  punctuation: {
    comma: 0,
    period: 0,
    question: 0,
    exclaim: 0,
    colon: 0,
  },
  ellipsis: {
    dotAdvance: 0.09,
    dotDuration: 0.08,
    dotHold: 0.01,
    tailPause: 0.18,
    dotFromY: 3,
    dotFromScale: 0.92,
  },
  phrase: {
    slowLeadAdvance: 0.032,
    slowLeadDuration: 0.08,
    slowLeadHold: 0.04,
    fastLeadAdvance: 0.032,
    fastLeadDuration: 0.08,
    softAdvance: 0.032,
    softDuration: 0.08,
    tailPause: 0.07,
    particleTailPause: 0.04,
  },
};

const PHRASE_PATTERNS = [
  '嗯哼？',
  '嗯哼?',
  '诶嘿',
  '啊...',
  '啊……',
  '嗯...',
  '嗯……',
  '呃...',
  '呃……',
  '噢...',
  '噢……',
  '嗯？',
  '嗯?',
  '啊？',
  '啊?',
  '噢？',
  '噢?',
  '诶？',
  '诶?',
  '嘿？',
  '嘿?',
] as const;

const FONT_MODES: FontMode[] = ['A', 'B', 'C', 'D', 'E'];
const FORM_TYPES: FormType[] = ['A', 'B', 'C'];
const SKILL_MODES: SkillMode[] = ['B', 'C'];
const STORY_STYLE_MODES: StoryStyleMode[] = [
  'WORLD',
  'HAPPY_ADVENTURE',
  'JAPANESE_SHONEN',
  'WEIRD_GHOST',
  'SLICE_OF_LIFE',
  'CUSTOM',
];
const TYPEWRITER_SPEEDS: TypewriterSpeed[] = ['disable', 'normal', 'fast'];
const GLOBAL_SETTINGS_PATH = 'dialog_beauty.ui';
const CHAT_SETTINGS_PATH = 'dialog_beauty.story';
const SETTINGS_SYNC_EVENT = 'dialog_beauty_settings_sync';
const STORY_TONE_COST = 100;
const ROTE_REQUEST_HEADER = '[Request_Rote Blume]';
const ROTE_REMINDER_HEADER = '[Reminder_Rote Blume]';
const FP_PATH_CANDIDATES = [
  'stat_data.主角.FP',
  'stat_data.主角.fp',
  'stat_data.主角.命运点数',
  'stat_data.主角.命运点数(FP)',
  'stat_data.主角.命运点数fp',
  'stat_data.FP',
  'stat_data.fp',
  'stat_data.命运点数',
  '主角.FP',
  '主角.fp',
  '主角.命运点数',
  'FP',
  'fp',
  '命运点数',
] as const;

const fontOptions: Array<{ value: FontMode; label: string }> = [
  { value: 'A', label: 'A / Sthginkra' },
  { value: 'B', label: 'B / Yomeng' },
  { value: 'C', label: 'C / 真楷' },
  { value: 'D', label: 'D / Xiaolai' },
  { value: 'E', label: 'E / 麦圆' },
];

const formTypeOptions: Array<{ value: FormType; label: string }> = [
  { value: 'A', label: '实体化' },
  { value: 'B', label: '灵体化' },
  { value: 'C', label: '噤默化' },
];

const skillOptionGroups: Record<StorySkillKey, Array<{ value: SkillMode; label: string }>> = {
  skill1: [
    { value: 'B', label: '独一无二' },
    { value: 'C', label: '大千世界的你与我 / 仅限今生的我与你' },
  ],
  skill2: [
    { value: 'B', label: '不止于此' },
    { value: 'C', label: '步履不停 / 瓮、星屑、步伐' },
  ],
  skill3: [
    { value: 'B', label: '您的故事' },
    { value: 'C', label: '关闭您的故事' },
  ],
};

const blueStoryStyleOptions: Array<{ value: Exclude<StoryStyleMode, 'WORLD' | 'CUSTOM'>; label: string }> = [
  { value: 'HAPPY_ADVENTURE', label: '欢乐向冒险' },
  { value: 'JAPANESE_SHONEN', label: '日式王道' },
  { value: 'WEIRD_GHOST', label: '诡异探灵' },
  { value: 'SLICE_OF_LIFE', label: '平淡日常' },
];

const typewriterSpeedOptions: Array<{ value: TypewriterSpeed; label: string }> = [
  { value: 'disable', label: 'Disable' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Fast' },
];

const cards = ref<ElliaCard[]>([]);
const uiSettings = ref<DialogBeautyUiSettings>(getDefaultUiSettings());
const storySettings = ref<DialogBeautyStorySettings>(getDefaultStorySettings());
const activeSettingsCardId = ref<string | null>(null);
const settingsReady = ref(false);
const isStoryStyleDiyOpen = ref(false);
const storyStyleDiyDraft = ref('');
const storyStyleDiyStatus = ref('');
const contentRefs = new Map<string, HTMLElement>();
const cardRefs = new Map<string, HTMLElement>();
const timelineMap = new Map<string, gsap.core.Timeline>();
let intersectionObserver: IntersectionObserver | null = null;
const elliaFormLabels: Record<FormType, string> = {
  A: '实体化',
  B: '灵体化',
  C: '噤默化',
};
const elliaFormStatusPath = ['stat_data', '关系列表', '艾莉亚', '技能', '在您眼里', '效果', '当前状态'] as const;

const debugBadges = computed(() => [
  { key: 'type', label: elliaFormLabels[storySettings.value.formType] },
  { key: 'skill1', label: getSkillLabel('skill1', storySettings.value.skill1) },
  { key: 'skill2', label: getSkillLabel('skill2', storySettings.value.skill2) },
  { key: 'skill3', label: getSkillLabel('skill3', storySettings.value.skill3) },
  { key: 'skill4', label: getStoryStyleLabel(storySettings.value.skill4, storySettings.value.skill4Custom) },
]);

function getSkillLabel(skillKey: StorySkillKey, mode: SkillMode): string {
  return skillOptionGroups[skillKey].find(option => option.value === mode)?.label ?? mode;
}

function getStoryStyleLabel(mode: StoryStyleMode, customStyle = ''): string {
  if (mode === 'CUSTOM') {
    const normalizedCustomStyle = normalizeCustomStoryStyle(customStyle);
    return normalizedCustomStyle ? `自定义：${normalizedCustomStyle}` : '自定义 / Rote Blume';
  }

  if (mode === 'WORLD') {
    return '世界本身决定';
  }

  return blueStoryStyleOptions.find(option => option.value === mode)?.label ?? mode;
}

function getDefaultUiSettings(): DialogBeautyUiSettings {
  return {
    fontMode: getConfiguredFontMode(),
    animationEnabled: true,
    typewriterSpeed: 'fast',
  };
}

function getDefaultStorySettings(): DialogBeautyStorySettings {
  return {
    formType: 'B',
    skill1: 'B',
    skill2: 'B',
    skill3: 'B',
    skill4: 'WORLD',
    skill4Custom: '',
    skill4Request: false,
  };
}

function getConfiguredFontMode(): FontMode {
  const configuredMode = (document.body.dataset.elliaFont ?? 'A').toUpperCase();
  return FONT_MODES.includes(configuredMode as FontMode) ? (configuredMode as FontMode) : 'A';
}

function normalizeUiSettings(value: unknown): DialogBeautyUiSettings {
  const source = typeof value === 'object' && value !== null ? (value as Partial<DialogBeautyUiSettings>) : {};
  const fontMode = typeof source.fontMode === 'string' ? source.fontMode.toUpperCase() : '';

  return {
    fontMode: FONT_MODES.includes(fontMode as FontMode) ? (fontMode as FontMode) : getConfiguredFontMode(),
    animationEnabled: source.animationEnabled !== false,
    typewriterSpeed: TYPEWRITER_SPEEDS.includes(source.typewriterSpeed as TypewriterSpeed)
      ? (source.typewriterSpeed as TypewriterSpeed)
      : 'fast',
  };
}

function normalizeStorySettings(value: unknown): DialogBeautyStorySettings {
  const source = typeof value === 'object' && value !== null ? (value as Partial<DialogBeautyStorySettings>) : {};
  const formType = typeof source.formType === 'string' ? source.formType.toUpperCase() : '';
  const skill1 = typeof source.skill1 === 'string' ? source.skill1.toUpperCase() : '';
  const skill2 = typeof source.skill2 === 'string' ? source.skill2.toUpperCase() : '';
  const rawSkill3 = typeof source.skill3 === 'string' ? source.skill3.trim() : '';
  const skill3 = rawSkill3.toUpperCase();
  const legacySkill3StoryStyle = rawSkill3 && !SKILL_MODES.includes(skill3 as SkillMode) ? rawSkill3 : undefined;
  const skill4 = normalizeStoryStyleMode(source.skill4 ?? legacySkill3StoryStyle);

  return {
    formType: FORM_TYPES.includes(formType as FormType) ? (formType as FormType) : 'B',
    skill1: SKILL_MODES.includes(skill1 as SkillMode) ? (skill1 as SkillMode) : 'B',
    skill2: SKILL_MODES.includes(skill2 as SkillMode) ? (skill2 as SkillMode) : 'B',
    skill3: SKILL_MODES.includes(skill3 as SkillMode) ? (skill3 as SkillMode) : 'B',
    skill4,
    skill4Custom: normalizeCustomStoryStyle(source.skill4Custom),
    skill4Request: source.skill4Request === true,
  };
}

function normalizeStoryStyleMode(value: unknown): StoryStyleMode {
  const rawValue = typeof value === 'string' ? value.trim() : '';
  const upperValue = rawValue.toUpperCase();
  const aliases: Record<string, StoryStyleMode> = {
    '': 'WORLD',
    WORLD: 'WORLD',
    世界本身决定: 'WORLD',
    欢乐向冒险: 'HAPPY_ADVENTURE',
    日式王道: 'JAPANESE_SHONEN',
    诡异探灵: 'WEIRD_GHOST',
    平淡日常: 'SLICE_OF_LIFE',
    自定义: 'CUSTOM',
    CUSTOM: 'CUSTOM',
  };

  const normalized = aliases[rawValue] ?? aliases[upperValue] ?? upperValue;
  return STORY_STYLE_MODES.includes(normalized as StoryStyleMode) ? (normalized as StoryStyleMode) : 'WORLD';
}

function normalizeCustomStoryStyle(value: unknown): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, 80) : '';
}

function safeGetVariables(option: VariableOption): Record<string, any> {
  try {
    return _.cloneDeep(getVariables(option));
  } catch (error) {
    console.warn('读取变量失败', option, error);
    return {};
  }
}

function getFormTypeFromText(value: unknown): FormType | null {
  const text = String(value ?? '').trim();
  for (const [mode, label] of Object.entries(elliaFormLabels) as Array<[FormType, string]>) {
    if (text === label) {
      return mode;
    }
  }

  if (text.includes('当前处于实体化') || text.includes('当前形态：实体化')) return 'A';
  if (text.includes('当前处于灵体化') || text.includes('当前形态：灵体化')) return 'B';
  if (text.includes('当前处于噤默化') || text.includes('当前形态：噤默化')) return 'C';
  return null;
}

function getFormTypeFromMessageVariables(variables: Record<string, any>): FormType | null {
  const statusMode = getFormTypeFromText(_.get(variables, elliaFormStatusPath));
  if (statusMode) {
    return statusMode;
  }

  const effect = _.get(variables, elliaFormStatusPath.slice(0, -1));
  if (!effect || typeof effect !== 'object') {
    return null;
  }

  for (const value of Object.values(effect)) {
    const text = String(value ?? '');
    if (text.includes('当前处于实体化')) return 'A';
    if (text.includes('当前处于灵体化')) return 'B';
    if (text.includes('当前处于噤默化')) return 'C';
  }

  for (const [mode, label] of Object.entries(elliaFormLabels) as Array<[FormType, string]>) {
    if (Object.prototype.hasOwnProperty.call(effect, label)) {
      return mode;
    }
  }

  for (const value of Object.values(effect)) {
    const mode = getFormTypeFromText(value);
    if (mode) {
      return mode;
    }
  }

  return null;
}

function syncFormTypeToMessageVariables(mode: FormType): boolean {
  const messageOption = { type: 'message', message_id: 'latest' } as VariableOption;
  const variables = safeGetVariables(messageOption);
  const label = elliaFormLabels[mode];

  _.set(variables, elliaFormStatusPath, label);
  replaceVariables(variables, messageOption);
  return true;
}

function persistUiSettings() {
  try {
    const variables = safeGetVariables({ type: 'global' });
    _.set(variables, GLOBAL_SETTINGS_PATH, _.cloneDeep(uiSettings.value));
    replaceVariables(variables, { type: 'global' });
  } catch (error) {
    console.warn('保存全局设置失败', error);
  }
}

function persistStorySettings() {
  try {
    const variables = safeGetVariables({ type: 'chat' });
    _.set(variables, CHAT_SETTINGS_PATH, _.cloneDeep(storySettings.value));
    replaceVariables(variables, { type: 'chat' });
  } catch (error) {
    console.warn('保存聊天设置失败', error);
  }
}

function loadPersistedSettings() {
  const globalVariables = safeGetVariables({ type: 'global' });
  const chatVariables = safeGetVariables({ type: 'chat' });
  const messageVariables = safeGetVariables({ type: 'message', message_id: 'latest' } as VariableOption);
  const messageFormType = getFormTypeFromMessageVariables(messageVariables);
  uiSettings.value = normalizeUiSettings(_.get(globalVariables, GLOBAL_SETTINGS_PATH));
  storySettings.value = normalizeStorySettings(_.get(chatVariables, CHAT_SETTINGS_PATH));
  if (messageFormType) {
    storySettings.value.formType = messageFormType;
  }
}

function handleExternalSettingsSync(payload?: { source?: string; scope?: string; key?: string }) {
  console.info('收到外部 Dialog Beauty 设置同步事件', payload ?? {});
  loadPersistedSettings();

  if (uiSettings.value.typewriterSpeed === 'disable') {
    cards.value.forEach(card => {
      if (card.isAnimating) {
        stopAnimation(card.id, true);
      }
    });
  }
}

function scaleTiming(value: number, multiplier: number): number {
  return Number((value * multiplier).toFixed(4));
}

function createRhythmProfile(speed: Exclude<TypewriterSpeed, 'disable'>): RhythmProfile {
  const multiplier = speed === 'normal' ? 1.7 : 1;

  return {
    baseAdvance: scaleTiming(BASE_RHYTHM.baseAdvance, multiplier),
    actionAdvance: scaleTiming(BASE_RHYTHM.actionAdvance, multiplier),
    lineGap: scaleTiming(BASE_RHYTHM.lineGap, multiplier),
    punctuation: {
      comma: scaleTiming(BASE_RHYTHM.punctuation.comma, multiplier),
      period: scaleTiming(BASE_RHYTHM.punctuation.period, multiplier),
      question: scaleTiming(BASE_RHYTHM.punctuation.question, multiplier),
      exclaim: scaleTiming(BASE_RHYTHM.punctuation.exclaim, multiplier),
      colon: scaleTiming(BASE_RHYTHM.punctuation.colon, multiplier),
    },
    ellipsis: {
      dotAdvance: scaleTiming(BASE_RHYTHM.ellipsis.dotAdvance, multiplier),
      dotDuration: scaleTiming(BASE_RHYTHM.ellipsis.dotDuration, multiplier),
      dotHold: scaleTiming(BASE_RHYTHM.ellipsis.dotHold, multiplier),
      tailPause: scaleTiming(BASE_RHYTHM.ellipsis.tailPause, multiplier),
      dotFromY: BASE_RHYTHM.ellipsis.dotFromY,
      dotFromScale: BASE_RHYTHM.ellipsis.dotFromScale,
    },
    phrase: {
      slowLeadAdvance: scaleTiming(BASE_RHYTHM.phrase.slowLeadAdvance, multiplier),
      slowLeadDuration: scaleTiming(BASE_RHYTHM.phrase.slowLeadDuration, multiplier),
      slowLeadHold: scaleTiming(BASE_RHYTHM.phrase.slowLeadHold, multiplier),
      fastLeadAdvance: scaleTiming(BASE_RHYTHM.phrase.fastLeadAdvance, multiplier),
      fastLeadDuration: scaleTiming(BASE_RHYTHM.phrase.fastLeadDuration, multiplier),
      softAdvance: scaleTiming(BASE_RHYTHM.phrase.softAdvance, multiplier),
      softDuration: scaleTiming(BASE_RHYTHM.phrase.softDuration, multiplier),
      tailPause: scaleTiming(BASE_RHYTHM.phrase.tailPause, multiplier),
      particleTailPause: scaleTiming(BASE_RHYTHM.phrase.particleTailPause, multiplier),
    },
  };
}

function stripThinkingContent(message: string): string {
  const closingTags = ['</thinking>', '</think>'] as const;
  let selectedIndex = -1;
  let selectedTag = '';

  closingTags.forEach(tag => {
    const index = message.lastIndexOf(tag);
    if (index > selectedIndex) {
      selectedIndex = index;
      selectedTag = tag;
    }
  });

  if (selectedIndex === -1) {
    return message;
  }

  return message.slice(selectedIndex + selectedTag.length);
}

function parseLines(rawText: string): ParsedLine[] {
  const parsedLines: ParsedLine[] = [];
  const tokenRegex = /「([^」]+)」|(\([^\n()]+\))/g;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(rawText)) !== null) {
    if (match[1]) {
      parsedLines.push({ type: 'dialogue', text: match[1].trim() });
      continue;
    }

    if (match[2]) {
      parsedLines.push({ type: 'action', text: match[2].trim() });
    }
  }

  if (parsedLines.length) {
    return parsedLines;
  }

  return rawText
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
    .map<ParsedLine>(line => ({
      type: /^\(.+\)$/.test(line) ? 'action' : 'dialogue',
      text: line,
    }));
}

function createElliaCard(attrText: string, rawBody: string, index: number): ElliaCard | null {
  const body = rawBody.replace(/\r/g, '').trim();
  const nameMatch = attrText.match(/\bname=(['"])(.*?)\1/);
  const lines = parseLines(body);

  if (!lines.length) {
    return null;
  }

  return {
    id: `ellia-card-${index}`,
    name: nameMatch?.[2]?.trim() || '艾莉亚',
    lines,
    hasPlayed: false,
    isAnimating: false,
    canReplay: false,
    isVisible: true,
  };
}

function getElliaRegistryStore(): Record<string, ElliaInstanceRegistryEntry> {
  const hostWindow = window.parent as Window &
    typeof globalThis & {
      __ELLIA_INSTANCE_REGISTRY__?: Record<string, ElliaInstanceRegistryEntry>;
    };

  hostWindow.__ELLIA_INSTANCE_REGISTRY__ ??= {};
  return hostWindow.__ELLIA_INSTANCE_REGISTRY__;
}

function getCurrentIframeElement(): HTMLIFrameElement | null {
  if (window.frameElement instanceof HTMLIFrameElement) {
    return window.frameElement;
  }

  const iframeName = getIframeName();
  const iframeById = window.parent.document.getElementById(iframeName);
  if (iframeById instanceof HTMLIFrameElement) {
    return iframeById;
  }

  const iframeByName = window.parent.document.querySelector(`iframe[name="${iframeName}"]`);
  return iframeByName instanceof HTMLIFrameElement ? iframeByName : null;
}

function getCurrentElliaInstanceNames(messageId: number, currentIframe: HTMLIFrameElement | null): string[] {
  const displayedMessage = retrieveDisplayedMessage(messageId)[0];
  if (!(displayedMessage instanceof HTMLElement)) {
    return [];
  }

  const currentSrc = currentIframe?.getAttribute('src') ?? '';
  return Array.from(displayedMessage.querySelectorAll<HTMLIFrameElement>('iframe'))
    .filter(iframe => {
      if (currentSrc) {
        return (iframe.getAttribute('src') ?? '') === currentSrc;
      }

      return true;
    })
    .map(iframe => iframe.getAttribute('name') ?? iframe.id)
    .filter(Boolean);
}

function getCurrentElliaBlockIndex(message: string): number {
  const messageId = getCurrentMessageId();
  const iframeName = getIframeName();
  const iframeElement = getCurrentIframeElement();
  const visibleMessage = stripThinkingContent(message);
  const totalBlocks = Array.from(visibleMessage.matchAll(/<ellia\b([^>]*)>([\s\S]*?)<\/ellia>/g)).length;
  const registryKey = `${messageId}`;
  const registryStore = getElliaRegistryStore();
  const liveNames = new Set(getCurrentElliaInstanceNames(messageId, iframeElement));
  const previousEntry = registryStore[registryKey];

  if (!previousEntry || previousEntry.signature !== visibleMessage) {
    registryStore[registryKey] = {
      signature: visibleMessage,
      assignments: {},
    };
  }

  const entry = registryStore[registryKey]!;
  Object.keys(entry.assignments).forEach(name => {
    if (!liveNames.size || liveNames.has(name)) {
      return;
    }

    delete entry.assignments[name];
  });

  if (typeof entry.assignments[iframeName] === 'number') {
    return entry.assignments[iframeName]!;
  }

  const usedIndexes = new Set(Object.values(entry.assignments));
  let nextIndex = 0;
  while (usedIndexes.has(nextIndex) && nextIndex < totalBlocks) {
    nextIndex += 1;
  }

  entry.assignments[iframeName] = nextIndex;
  return entry.assignments[iframeName]!;
}

function parseCurrentElliaBlock(message: string, blockIndex: number): ElliaCard | null {
  const visibleMessage = stripThinkingContent(message);
  const matches = Array.from(visibleMessage.matchAll(/<ellia\b([^>]*)>([\s\S]*?)<\/ellia>/g));
  const match = matches[blockIndex];
  if (!match) {
    return null;
  }

  return createElliaCard(match[1] ?? '', match[2] ?? '', blockIndex);
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

function parseFpValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const match = value.match(/-?\d+(?:\.\d+)?/);
    if (match) {
      const parsed = Number(match[0]);
      return Number.isFinite(parsed) ? parsed : null;
    }
  }

  return null;
}

function findFpState(variables: Record<string, any>): { path: string; value: number } | null {
  for (const path of FP_PATH_CANDIDATES) {
    const value = parseFpValue(_.get(variables, path));
    if (value !== null) {
      return { path, value };
    }
  }

  return null;
}

function spendStoryToneFp(): { ok: boolean; reason?: string; remaining?: number } {
  const messageOption = { type: 'message', message_id: 'latest' } as VariableOption;
  const messageVariables = safeGetVariables(messageOption);
  const fpState = findFpState(messageVariables);

  if (!fpState) {
    return { ok: false, reason: '未找到 FP 变量。' };
  }

  if (fpState.value < STORY_TONE_COST) {
    return { ok: false, reason: `FP 不足：当前 ${fpState.value}，需要 ${STORY_TONE_COST}。` };
  }

  const remaining = fpState.value - STORY_TONE_COST;
  _.set(messageVariables, fpState.path, remaining);
  replaceVariables(messageVariables, messageOption);
  return { ok: true, remaining };
}

function getPromptInput(): HTMLElement | null {
  const hostDocument = window.parent?.document ?? document;
  const selectors = [
    '#send_textarea',
    'textarea#send_textarea',
    'textarea[name="send_textarea"]',
    '#message_textarea',
    'textarea',
    '[contenteditable="true"]',
  ];

  for (const selector of selectors) {
    const element = hostDocument.querySelector(selector);
    if (element?.nodeType === 1) {
      return element as HTMLElement;
    }
  }

  return null;
}

function insertIntoPromptInput(text: string): boolean {
  const input = getPromptInput();
  if (!input) {
    return false;
  }

  const tagName = input.tagName.toLowerCase();
  if (tagName === 'textarea' || tagName === 'input') {
    const control = input as HTMLTextAreaElement | HTMLInputElement;
    const current = control.value.trimEnd();
    control.value = current ? `${current}\n${text}` : text;
  } else {
    const current = (input.textContent ?? '').trimEnd();
    input.textContent = current ? `${current}\n${text}` : text;
  }

  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  input.focus();
  return true;
}

function escapeMarkerContent(value: string): string {
  return value.replace(/"/g, "'");
}

function buildStoryToneReminder(tone: string): string {
  const safeTone = tone.replace(/"/g, "'");
  return `${ROTE_REMINDER_HEADER} 用户已設定自定义故事风格: "${safeTone}"`;
}

function buildStoryToneRequest(tone: string): string {
  return `${ROTE_REQUEST_HEADER} 用户要求艾莉亚协助生成故事风格: "${escapeMarkerContent(tone)}"`;
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

function classifyPunctuation(char: string): Exclude<TokenKind, 'plain' | 'ellipsis' | 'phrase'> | null {
  if (char === '，' || char === ',' || char === '、') {
    return 'comma';
  }
  if (char === '。' || char === '.') {
    return 'period';
  }
  if (char === '？' || char === '?') {
    return 'question';
  }
  if (char === '！' || char === '!') {
    return 'exclaim';
  }
  if (char === '：' || char === ':' || char === '；' || char === ';') {
    return 'colon';
  }
  return null;
}

function tokenizeLine(text: string): LineToken[] {
  const tokens: LineToken[] = [];

  for (let index = 0; index < text.length; ) {
    const phrase = PHRASE_PATTERNS.find(pattern => text.startsWith(pattern, index));
    if (phrase) {
      tokens.push({ kind: 'phrase', text: phrase });
      index += phrase.length;
      continue;
    }

    if (text.startsWith('...', index)) {
      tokens.push({ kind: 'ellipsis', text: '...' });
      index += 3;
      continue;
    }

    if (text[index] === '…') {
      let end = index;
      while (text[end] === '…') {
        end += 1;
      }
      tokens.push({ kind: 'ellipsis', text: text.slice(index, end) });
      index = end;
      continue;
    }

    const char = text[index] ?? '';
    const punctuationKind = classifyPunctuation(char);
    if (punctuationKind) {
      tokens.push({ kind: punctuationKind, text: char });
    } else {
      tokens.push({ kind: 'plain', text: char });
    }
    index += 1;
  }

  return tokens;
}

function renderStaticText(cardId: string) {
  const contentElement = contentRefs.get(cardId);
  const card = getCard(cardId);
  if (!contentElement || !card) {
    return;
  }

  const lineElements = Array.from(contentElement.querySelectorAll<HTMLElement>('.ellia-v2-line'));
  lineElements.forEach((lineElement, index) => {
    const line = card.lines[index];
    if (!line) {
      return;
    }

    if (line.type === 'action') {
      let actionElement = lineElement.querySelector<HTMLElement>('.ellia-v2-action');
      if (!actionElement) {
        actionElement = document.createElement('span');
        actionElement.className = 'ellia-v2-action';
        lineElement.replaceChildren(actionElement);
      }
      actionElement.textContent = line.text;
      return;
    }

    lineElement.textContent = line.text;
  });
}

function rebuildCharacters(cardId: string): PreparedLine[] {
  const contentElement = contentRefs.get(cardId);
  const card = getCard(cardId);
  if (!contentElement || !card) {
    return [];
  }

  const lineElements = Array.from(contentElement.querySelectorAll<HTMLElement>('.ellia-v2-line'));
  const preparedLines: PreparedLine[] = [];
  let firstVisibleCharacterMarked = false;

  lineElements.forEach((lineElement, index) => {
    const line = card.lines[index];
    if (!line) {
      return;
    }

    const target =
      (line.type === 'action' ? lineElement.querySelector<HTMLElement>('.ellia-v2-action') : lineElement) ??
      lineElement;

    target.textContent = '';
    const chars: PreparedChar[] = [];

    for (const char of line.text) {
      const span = document.createElement('span');
      span.className = 'ellia-v2-char';
      span.textContent = char;

      if (!firstVisibleCharacterMarked && /\S/.test(char)) {
        span.classList.add('is-first-char');
        firstVisibleCharacterMarked = true;
      }

      target.appendChild(span);
      chars.push({ element: span, char });
    }

    preparedLines.push({ type: line.type, text: line.text, chars });
  });

  return preparedLines;
}

function revealCharacter(
  timeline: gsap.core.Timeline,
  element: HTMLElement,
  cursor: number,
  options: RevealOptions = {},
): number {
  const duration = options.duration ?? 0.12;
  const advance = options.advance ?? BASE_RHYTHM.baseAdvance;
  const hold = options.hold ?? 0;
  const fromY = options.fromY ?? 2;
  const fromScale = options.fromScale ?? 0.97;
  const ease = options.ease ?? 'power2.out';

  timeline.fromTo(
    element,
    {
      opacity: 0,
      y: fromY,
      scale: fromScale,
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration,
      ease,
    },
    cursor,
  );

  return cursor + advance + hold;
}

function revealQuestionMark(
  timeline: gsap.core.Timeline,
  element: HTMLElement,
  cursor: number,
  rhythm: RhythmProfile,
): number {
  return revealCharacter(timeline, element, cursor, {
    duration: rhythm.phrase.fastLeadDuration,
    advance: rhythm.baseAdvance,
    hold: rhythm.punctuation.question,
    fromY: 1,
    fromScale: 0.98,
    ease: 'power2.out',
  });
}

function revealEllipsis(
  timeline: gsap.core.Timeline,
  dots: HTMLElement[],
  cursor: number,
  rhythm: RhythmProfile,
): number {
  dots.forEach(dot => {
    cursor = revealCharacter(timeline, dot, cursor, {
      duration: rhythm.ellipsis.dotDuration,
      advance: rhythm.ellipsis.dotAdvance,
      hold: rhythm.ellipsis.dotHold,
      fromY: rhythm.ellipsis.dotFromY,
      fromScale: rhythm.ellipsis.dotFromScale,
      ease: 'back.out(1.3)',
    });
  });

  return cursor + rhythm.ellipsis.tailPause;
}

function schedulePlainToken(
  timeline: gsap.core.Timeline,
  spans: HTMLElement[],
  lineType: ParsedLine['type'],
  cursor: number,
  nextToken: LineToken | undefined,
  rhythm: RhythmProfile,
): number {
  const span = spans[0];
  if (!span) {
    return cursor;
  }

  const char = span.textContent ?? '';
  const advance = lineType === 'action' ? rhythm.actionAdvance : rhythm.baseAdvance;
  const isInterjection = ['嗯', '呃', '啊', '噢', '诶', '嘿', '哼'].includes(char);
  const isParticleTail = ['呢', '啦', '嘛', '呀', '哦'].includes(char) && (!nextToken || nextToken.kind !== 'plain');
  let hold = 0;

  if (isInterjection) {
    hold = rhythm.phrase.tailPause;
  }

  if (isParticleTail) {
    hold = Math.max(hold, rhythm.phrase.particleTailPause);
  }

  return revealCharacter(timeline, span, cursor, {
    duration: rhythm.phrase.softDuration,
    advance,
    hold,
    fromY: lineType === 'action' ? 1.3 : 1.5,
    fromScale: 0.98,
    ease: 'power2.out',
  });
}

function schedulePunctuationToken(
  timeline: gsap.core.Timeline,
  token: LineToken,
  spans: HTMLElement[],
  cursor: number,
  rhythm: RhythmProfile,
): number {
  const span = spans[0];
  if (!span) {
    return cursor;
  }

  if (token.kind === 'question') {
    return revealQuestionMark(timeline, span, cursor, rhythm);
  }

  const hold =
    token.kind === 'comma'
      ? rhythm.punctuation.comma
      : token.kind === 'period'
        ? rhythm.punctuation.period
        : token.kind === 'exclaim'
          ? rhythm.punctuation.exclaim
          : rhythm.punctuation.colon;

  return revealCharacter(timeline, span, cursor, {
    duration: rhythm.phrase.fastLeadDuration,
    advance: rhythm.baseAdvance,
    hold,
    fromY: 1,
    fromScale: 0.98,
    ease: 'power2.out',
  });
}

function schedulePhraseToken(
  timeline: gsap.core.Timeline,
  token: LineToken,
  spans: HTMLElement[],
  cursor: number,
  rhythm: RhythmProfile,
): number {
  const ellipsisMatch = token.text.match(/(\.\.\.|…+)$/);

  if (ellipsisMatch) {
    const prefixLength = Array.from(token.text.slice(0, -ellipsisMatch[0].length)).length;
    const prefixSpans = spans.slice(0, prefixLength);
    const ellipsisSpans = spans.slice(prefixLength);

    prefixSpans.forEach((span, index) => {
      cursor = revealCharacter(timeline, span, cursor, {
        duration: rhythm.phrase.slowLeadDuration,
        advance: rhythm.phrase.slowLeadAdvance,
        hold: index === prefixSpans.length - 1 ? rhythm.phrase.slowLeadHold : 0,
        fromY: 1.5,
        fromScale: 0.98,
        ease: 'power2.out',
      });
    });

    return revealEllipsis(timeline, ellipsisSpans, cursor, rhythm);
  }

  spans.forEach(span => {
    cursor = revealCharacter(timeline, span, cursor, {
      duration: rhythm.phrase.fastLeadDuration,
      advance: rhythm.phrase.fastLeadAdvance,
      fromY: 1.5,
      fromScale: 0.98,
      ease: 'power2.out',
    });
  });

  return cursor + rhythm.phrase.tailPause;
}

function buildTimeline(cardId: string): gsap.core.Timeline | null {
  const preparedLines = rebuildCharacters(cardId);
  const card = getCard(cardId);
  if (!preparedLines.length || !card) {
    return null;
  }

  const rhythm = createRhythmProfile(uiSettings.value.typewriterSpeed === 'normal' ? 'normal' : 'fast');
  const timeline = gsap.timeline({
    paused: true,
    onComplete: () => {
      card.isAnimating = false;
      card.canReplay = true;
      timelineMap.delete(cardId);
      renderStaticText(cardId);
    },
  });

  let cursor = 0;

  preparedLines.forEach((line, lineIndex) => {
    const tokens = tokenizeLine(line.text);
    let charOffset = 0;

    tokens.forEach((token, tokenIndex) => {
      const tokenLength = Array.from(token.text).length;
      const spans = line.chars.slice(charOffset, charOffset + tokenLength).map(item => item.element);
      charOffset += tokenLength;
      const nextToken = tokens[tokenIndex + 1];

      if (token.kind === 'phrase') {
        cursor = schedulePhraseToken(timeline, token, spans, cursor, rhythm);
        return;
      }

      if (token.kind === 'ellipsis') {
        cursor = revealEllipsis(timeline, spans, cursor, rhythm);
        return;
      }

      if (token.kind === 'plain') {
        cursor = schedulePlainToken(timeline, spans, line.type, cursor, nextToken, rhythm);
        return;
      }

      cursor = schedulePunctuationToken(timeline, token, spans, cursor, rhythm);
    });

    if (lineIndex < preparedLines.length - 1) {
      cursor += rhythm.lineGap;
    }
  });

  return timeline;
}

function stopAnimation(cardId: string, showReplayHint: boolean) {
  const card = getCard(cardId);
  if (!card) {
    return;
  }

  killTimeline(cardId);
  renderStaticText(cardId);
  card.isAnimating = false;
  card.canReplay = showReplayHint;
}

function startAnimation(cardId: string, forceReplay = false) {
  const card = getCard(cardId);
  if (!card || !card.isVisible) {
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
    renderStaticText(cardId);
    card.isAnimating = false;
    card.hasPlayed = true;
    card.canReplay = true;
    return;
  }

  const timeline = buildTimeline(cardId);
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
  loadPersistedSettings();

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
  cards.value.forEach(cardItem => renderStaticText(cardItem.id));
  setupIntersectionObserver();
  settingsReady.value = true;
}

watch(
  uiSettings,
  () => {
    if (!settingsReady.value) {
      return;
    }

    persistUiSettings();
  },
  { deep: true },
);

watch(
  storySettings,
  () => {
    if (!settingsReady.value) {
      return;
    }

    persistStorySettings();
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

.ellia-v2-settings-host {
  position: relative;
  z-index: 7;
  padding: 0 14px 14px;
}

.ellia-v2-settings-modal {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 1rem;
  border: 1px solid rgba(224, 176, 255, 0.28);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(35, 13, 44, 0.98), rgba(21, 10, 31, 0.96)), rgba(26, 11, 38, 0.98);
  box-shadow:
    0 16px 32px rgba(0, 0, 0, 0.42),
    0 0 24px rgba(155, 89, 182, 0.18),
    inset 0 0 0 1px rgba(224, 176, 255, 0.08);
}

.ellia-v2-settings-modal-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.8rem;
}

.ellia-v2-settings-heading {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.ellia-v2-settings-title-main {
  color: #f3dbff;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.ellia-v2-settings-title-sub {
  color: rgba(233, 206, 247, 0.76);
  font-size: 0.68rem;
}

.ellia-v2-settings-close {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border: 1px solid rgba(224, 176, 255, 0.46);
  border-radius: 999px;
  background: rgba(52, 21, 66, 0.84);
  color: #f4ddff;
  font-size: 0.9rem;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 0 12px rgba(155, 89, 182, 0.2);
  transition:
    background 0.22s ease,
    transform 0.22s ease,
    box-shadow 0.22s ease;
}

.ellia-v2-settings-close:hover {
  background: rgba(83, 33, 103, 0.96);
  transform: translateY(-1px);
  box-shadow: 0 0 16px rgba(224, 176, 255, 0.34);
}

.ellia-v2-settings-section + .ellia-v2-settings-section {
  margin-top: 0.7rem;
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

  .ellia-v2-settings-host {
    padding: 0 8px 10px;
  }

  .ellia-v2-settings-modal {
    max-width: none;
    padding: 0.85rem;
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
