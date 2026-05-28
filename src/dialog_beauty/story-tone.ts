import { FP_PATH_CANDIDATES, ROTE_REMINDER_HEADER, ROTE_REQUEST_HEADER, STORY_TONE_COST } from './constants';
import { safeGetVariables } from './settings';

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

function escapeMarkerContent(value: string): string {
  return value.replace(/"/g, "'");
}

export function spendStoryToneFp(): { ok: boolean; reason?: string; remaining?: number } {
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

export function insertIntoPromptInput(text: string): boolean {
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

export function buildStoryToneReminder(tone: string): string {
  const safeTone = tone.replace(/"/g, "'");
  return `${ROTE_REMINDER_HEADER} 用户已设定自定义故事风格: "${safeTone}"`;
}

export function buildStoryToneRequest(tone: string): string {
  return `${ROTE_REQUEST_HEADER} 用户要求艾莉亚协助生成故事风格: "${escapeMarkerContent(tone)}"`;
}
