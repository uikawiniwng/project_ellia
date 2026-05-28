export interface ParsedLine {
  type: 'dialogue' | 'action';
  text: string;
}

export interface ElliaCard {
  id: string;
  name: string;
  mood?: string;
  lines: ParsedLine[];
  hasPlayed: boolean;
  isAnimating: boolean;
  canReplay: boolean;
  isVisible: boolean;
}

export type TokenKind = 'plain' | 'ellipsis' | 'comma' | 'period' | 'question' | 'exclaim' | 'colon' | 'phrase';
export type FontMode = 'A' | 'B' | 'C' | 'D' | 'E';
export type FormType = 'A' | 'B' | 'C';
export type SkillMode = 'A' | 'B' | 'C';
export type StoryStyleMode = 'WORLD' | 'HAPPY_ADVENTURE' | 'JAPANESE_SHONEN' | 'NEW WEIRD' | 'SLICE_OF_LIFE' | 'CUSTOM';
export type TypewriterSpeed = 'disable' | 'normal' | 'fast';
export type StorySkillKey = 'skill1' | 'skill2' | 'skill3';
export type SettingsSectionKey = 'skill1' | 'skill2' | 'world' | 'beauty';

export interface LineToken {
  kind: TokenKind;
  text: string;
}

export interface PreparedChar {
  element: HTMLElement;
  char: string;
}

export interface PreparedLine {
  type: ParsedLine['type'];
  text: string;
  chars: PreparedChar[];
}

export interface RevealOptions {
  duration?: number;
  advance?: number;
  hold?: number;
  fromY?: number;
  fromScale?: number;
  ease?: string;
}

export interface ElliaInstanceRegistryEntry {
  signature: string;
  assignments: Record<string, number>;
}

export interface DialogBeautyUiSettings {
  fontMode: FontMode;
  animationEnabled: boolean;
  typewriterSpeed: TypewriterSpeed;
  avatarMode: boolean;
}

export interface DialogBeautyStorySettings {
  formType: FormType;
  skill1: SkillMode;
  skill2: SkillMode;
  skill3: SkillMode;
  skill4: StoryStyleMode;
  skill4Custom: string;
  skill4Request: boolean;
}

export interface SettingsSectionMeta {
  key: SettingsSectionKey;
  title: string;
  glyph: string;
  motif: string;
  subtitle: string;
  summary: string;
  intro: string;
}

export interface RhythmProfile {
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
