import type {
  FontMode,
  FormType,
  RhythmProfile,
  SettingsSectionMeta,
  SkillMode,
  StorySkillKey,
  StoryStyleMode,
  TypewriterSpeed,
} from './types';

export const BASE_RHYTHM: RhythmProfile = {
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

export const PHRASE_PATTERNS = [
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

export const FONT_MODES: FontMode[] = ['A', 'B', 'C', 'D', 'E'];
export const FORM_TYPES: FormType[] = ['A', 'B', 'C'];
export const SKILL_MODES: SkillMode[] = ['A', 'B', 'C'];
export const STORY_STYLE_MODES: StoryStyleMode[] = [
  'WORLD',
  'HAPPY_ADVENTURE',
  'JAPANESE_SHONEN',
  'NEW WEIRD',
  'SLICE_OF_LIFE',
  'CUSTOM',
];
export const TYPEWRITER_SPEEDS: TypewriterSpeed[] = ['disable', 'normal', 'fast'];

export interface MoodAvatarEntry {
  primaryUrl: string;
  fallbackUrl: string;
}

export const DEFAULT_MOOD = 'smile';

export const MOOD_AVATAR_MAP: Record<string, MoodAvatarEntry> = {
  smile: {
    primaryUrl: 'https://files.catbox.moe/elgw3w.png',
    fallbackUrl: 'https://s3.bmp.ovh/2026/05/10/x7qQmRC2.png',
  },
  惊讶: {
    primaryUrl: 'https://files.catbox.moe/5389fr.png',
    fallbackUrl: 'https://s3.bmp.ovh/2026/05/10/at3AloWb.png',
  },
  担心: {
    primaryUrl: 'https://files.catbox.moe/hom1zr.png',
    fallbackUrl: 'https://s3.bmp.ovh/2026/05/10/fsXibuf8.png',
  },
  温柔: {
    primaryUrl: 'https://files.catbox.moe/g5fwcu.png',
    fallbackUrl: 'https://s3.bmp.ovh/2026/05/10/IeRlQkjj.png',
  },
  期待: {
    primaryUrl: 'https://files.catbox.moe/9xjb0c.png',
    fallbackUrl: 'https://s3.bmp.ovh/2026/05/10/lp95isi7.png',
  },
  敌视: {
    primaryUrl: 'https://files.catbox.moe/88v1i9.png',
    fallbackUrl: 'https://s3.bmp.ovh/2026/05/10/CqN9I2pC.png',
  },
  施愿: {
    primaryUrl: 'https://files.catbox.moe/r94uy4.png',
    fallbackUrl: 'https://s3.bmp.ovh/2026/05/10/vkh0HmKm.png',
  },
  认真: {
    primaryUrl: 'https://files.catbox.moe/1av0zv.png',
    fallbackUrl: 'https://s3.bmp.ovh/2026/05/10/WGqI7ucl.png',
  },
  失措: {
    primaryUrl: 'https://files.catbox.moe/4qqins.png',
    fallbackUrl: 'https://s3.bmp.ovh/2026/05/10/2ze1Fgrt.png',
  },
  愉快: {
    primaryUrl: 'https://files.catbox.moe/wwch4a.png',
    fallbackUrl: 'https://s3.bmp.ovh/2026/05/10/oQL8FHeC.png',
  },
};

export const GLOBAL_SETTINGS_PATH = 'dialog_beauty.ui';
export const CHAT_SETTINGS_PATH = 'dialog_beauty.story';
export const SETTINGS_SYNC_EVENT = 'dialog_beauty_settings_sync';
export const STORY_TONE_COST = 100;
export const ROTE_REQUEST_HEADER = '[Request_Rote Blume]';
export const ROTE_REMINDER_HEADER = '[Reminder_Rote Blume]';

export const FP_PATH_CANDIDATES = [
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

export const fontOptions: Array<{ value: FontMode; label: string }> = [
  { value: 'A', label: 'A / Sthginkra' },
  { value: 'B', label: 'B / Yomeng' },
  { value: 'C', label: 'C / 真楷' },
  { value: 'D', label: 'D / Xiaolai' },
  { value: 'E', label: 'E / 麦圆' },
];

export const formTypeOptions: Array<{ value: FormType; label: string }> = [
  { value: 'A', label: '实体化' },
  { value: 'B', label: '灵体化' },
  { value: 'C', label: '噤默化' },
];

export const skillOptionGroups: Record<StorySkillKey, Array<{ value: SkillMode; label: string }>> = {
  skill1: [
    { value: 'A', label: '关闭技能1' },
    { value: 'B', label: '独一无二' },
    { value: 'C', label: '大千世界的你与我 / 仅限今生的我与你' },
  ],
  skill2: [
    { value: 'A', label: '关闭技能2' },
    { value: 'B', label: '不止于此' },
    { value: 'C', label: '步履不停 / 瓮、星屑、步伐' },
  ],
  skill3: [
    { value: 'B', label: '您的故事' },
    { value: 'C', label: '关闭您的故事' },
  ],
};

export const blueStoryStyleOptions: Array<{ value: Exclude<StoryStyleMode, 'WORLD' | 'CUSTOM'>; label: string }> = [
  { value: 'HAPPY_ADVENTURE', label: '欢乐向冒险' },
  { value: 'JAPANESE_SHONEN', label: '日式王道' },
  { value: 'NEW WEIRD', label: '诡谲探灵' },
  { value: 'SLICE_OF_LIFE', label: '平淡日常' },
];

export const typewriterSpeedOptions: Array<{ value: TypewriterSpeed; label: string }> = [
  { value: 'disable', label: 'Disable' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Fast' },
];

export const quickReplyOptionGroups = {
  skill1: ['记录你我的今生', '收下我们的赠礼'],
  skill2: ['拼缀手账'],
} as const;

export const elliaFormLabels: Record<FormType, string> = {
  A: '实体化',
  B: '灵体化',
  C: '噤默化',
};

export const elliaFormStatusPath = ['stat_data', '关系列表', '艾莉亚', '技能', '在您眼里', '效果', '当前状态'] as const;

export const settingsSections: SettingsSectionMeta[] = [
  {
    key: 'skill1',
    title: '第一个技能组',
    glyph: '🔮',
    motif: '水晶球',
    subtitle: 'FIRST SKILL SLOT',
    summary: '水晶球会看见您的命运\n无论是天赋，还是过去与未来',
    intro: '水晶球会看见您的命运\n无论是天赋，还是过去与未来',
  },
  {
    key: 'skill2',
    title: '第二个技能组',
    glyph: '🃏',
    motif: '塔罗牌',
    subtitle: 'SECOND SKILL SLOT',
    summary: '塔罗牌会预告您的成长\n就算是蠕虫，也终会翱翔于天空',
    intro: '塔罗牌会预告您的成长\n就算是蠕虫，也终会翱翔于天空',
  },
  {
    key: 'world',
    title: '关于这个世界',
    glyph: '✿',
    motif: '花占卜',
    subtitle: 'world setting',
    summary: '花儿会告诉你真正的东西\n围绕您环绕的世界到底是何样？',
    intro: '花儿会告诉你真正的东西\n围绕您环绕的世界到底是何样？',
  },
  {
    key: 'beauty',
    title: '关于您所见到的',
    glyph: '◬',
    motif: '碟仙',
    subtitle: 'BEAUTY SETTING',
    summary: '指尖,神明,字符\n隐秘的渴望,终会化作现实',
    intro: '指尖,神明,字符\n隐秘的渴望,终会化作现实。',
  },
];
