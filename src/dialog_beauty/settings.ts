import {
  blueStoryStyleOptions,
  CHAT_SETTINGS_PATH,
  elliaFormLabels,
  elliaFormStatusPath,
  FONT_MODES,
  FORM_TYPES,
  GLOBAL_SETTINGS_PATH,
  SKILL_MODES,
  skillOptionGroups,
  STORY_STYLE_MODES,
  TYPEWRITER_SPEEDS,
} from './constants';
import type {
  DialogBeautyStorySettings,
  DialogBeautyUiSettings,
  FontMode,
  FormType,
  SkillMode,
  StorySkillKey,
  StoryStyleMode,
  TypewriterSpeed,
} from './types';

export function getSkillLabel(skillKey: StorySkillKey, mode: SkillMode): string {
  return skillOptionGroups[skillKey].find(option => option.value === mode)?.label ?? mode;
}

export function getStoryStyleLabel(mode: StoryStyleMode, customStyle = ''): string {
  if (mode === 'CUSTOM') {
    const normalizedCustomStyle = normalizeCustomStoryStyle(customStyle);
    return normalizedCustomStyle ? `自定义：${normalizedCustomStyle}` : '自定义 / Rote Blume';
  }

  if (mode === 'WORLD') {
    return '世界本身决定';
  }

  return blueStoryStyleOptions.find(option => option.value === mode)?.label ?? mode;
}

export function getDefaultUiSettings(): DialogBeautyUiSettings {
  return {
    fontMode: getConfiguredFontMode(),
    animationEnabled: true,
    typewriterSpeed: 'fast',
    avatarMode: false,
  };
}

export function getDefaultStorySettings(): DialogBeautyStorySettings {
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

export function getConfiguredFontMode(): FontMode {
  const configuredMode = (document.body.dataset.elliaFont ?? 'A').toUpperCase();
  return FONT_MODES.includes(configuredMode as FontMode) ? (configuredMode as FontMode) : 'A';
}

export function normalizeUiSettings(value: unknown): DialogBeautyUiSettings {
  const source = typeof value === 'object' && value !== null ? (value as Partial<DialogBeautyUiSettings>) : {};
  const fontMode = typeof source.fontMode === 'string' ? source.fontMode.toUpperCase() : '';

  return {
    fontMode: FONT_MODES.includes(fontMode as FontMode) ? (fontMode as FontMode) : getConfiguredFontMode(),
    animationEnabled: source.animationEnabled !== false,
    typewriterSpeed: TYPEWRITER_SPEEDS.includes(source.typewriterSpeed as TypewriterSpeed)
      ? (source.typewriterSpeed as TypewriterSpeed)
      : 'fast',
    avatarMode: source.avatarMode === true,
  };
}

export function normalizeStorySettings(value: unknown): DialogBeautyStorySettings {
  const source = typeof value === 'object' && value !== null ? (value as Partial<DialogBeautyStorySettings>) : {};
  const formType = typeof source.formType === 'string' ? source.formType.toUpperCase() : '';
  const skill1 = typeof source.skill1 === 'string' ? source.skill1.toUpperCase() : '';
  const skill2 = typeof source.skill2 === 'string' ? source.skill2.toUpperCase() : '';
  const rawSkill3 = typeof source.skill3 === 'string' ? source.skill3.trim() : '';
  const skill3 = rawSkill3.toUpperCase();
  const legacySkill3StoryStyle = rawSkill3 && !['B', 'C'].includes(skill3) ? rawSkill3 : undefined;
  const skill4 = normalizeStoryStyleMode(source.skill4 ?? legacySkill3StoryStyle);

  return {
    formType: FORM_TYPES.includes(formType as FormType) ? (formType as FormType) : 'B',
    skill1: SKILL_MODES.includes(skill1 as SkillMode) ? (skill1 as SkillMode) : 'B',
    skill2: SKILL_MODES.includes(skill2 as SkillMode) ? (skill2 as SkillMode) : 'B',
    skill3: ['B', 'C'].includes(skill3) ? (skill3 as SkillMode) : 'B',
    skill4,
    skill4Custom: normalizeCustomStoryStyle(source.skill4Custom),
    skill4Request: source.skill4Request === true,
  };
}

export function normalizeStoryStyleMode(value: unknown): StoryStyleMode {
  const rawValue = typeof value === 'string' ? value.trim() : '';
  const upperValue = rawValue.toUpperCase();
  const aliases: Record<string, StoryStyleMode> = {
    '': 'WORLD',
    WORLD: 'WORLD',
    世界本身决定: 'WORLD',
    欢乐向冒险: 'HAPPY_ADVENTURE',
    日式王道: 'JAPANESE_SHONEN',
    'NEW WEIRD': 'NEW WEIRD',
    WEIRD_GHOST: 'NEW WEIRD',
    诡异探灵: 'NEW WEIRD',
    诡谲探灵: 'NEW WEIRD',
    平淡日常: 'SLICE_OF_LIFE',
    自定义: 'CUSTOM',
    CUSTOM: 'CUSTOM',
  };

  const normalized = aliases[rawValue] ?? aliases[upperValue] ?? upperValue;
  return STORY_STYLE_MODES.includes(normalized as StoryStyleMode) ? (normalized as StoryStyleMode) : 'WORLD';
}

export function normalizeCustomStoryStyle(value: unknown): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, 80) : '';
}

export function safeGetVariables(option: VariableOption): Record<string, any> {
  try {
    return _.cloneDeep(getVariables(option));
  } catch (error) {
    console.warn('读取变量失败', option, error);
    return {};
  }
}

export function getFormTypeFromText(value: unknown): FormType | null {
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

export function getFormTypeFromMessageVariables(variables: Record<string, any>): FormType | null {
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

export function syncFormTypeToMessageVariables(mode: FormType): boolean {
  const messageOption = { type: 'message', message_id: 'latest' } as VariableOption;
  const variables = safeGetVariables(messageOption);
  const label = elliaFormLabels[mode];

  _.set(variables, elliaFormStatusPath, label);
  replaceVariables(variables, messageOption);
  return true;
}

export function persistUiSettings(settings: DialogBeautyUiSettings) {
  try {
    const variables = safeGetVariables({ type: 'global' });
    _.set(variables, GLOBAL_SETTINGS_PATH, _.cloneDeep(settings));
    replaceVariables(variables, { type: 'global' });
  } catch (error) {
    console.warn('保存全局设置失败', error);
  }
}

export function persistStorySettings(settings: DialogBeautyStorySettings) {
  try {
    const variables = safeGetVariables({ type: 'chat' });
    _.set(variables, CHAT_SETTINGS_PATH, _.cloneDeep(settings));
    replaceVariables(variables, { type: 'chat' });
  } catch (error) {
    console.warn('保存聊天设置失败', error);
  }
}

export function readPersistedSettings(): {
  uiSettings: DialogBeautyUiSettings;
  storySettings: DialogBeautyStorySettings;
  messageFormType: FormType | null;
} {
  const globalVariables = safeGetVariables({ type: 'global' });
  const chatVariables = safeGetVariables({ type: 'chat' });
  const messageVariables = safeGetVariables({ type: 'message', message_id: 'latest' } as VariableOption);

  return {
    uiSettings: normalizeUiSettings(_.get(globalVariables, GLOBAL_SETTINGS_PATH)),
    storySettings: normalizeStorySettings(_.get(chatVariables, CHAT_SETTINGS_PATH)),
    messageFormType: getFormTypeFromMessageVariables(messageVariables),
  };
}
