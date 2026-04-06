<template>
  <div class="ellia-v2-root" :data-font-mode="fontMode">
    <div
      v-for="card in cards"
      :key="card.id"
      :ref="element => setCardRef(card.id, element)"
      class="ellia-v2-container"
      :class="{
        'is-animating': card.isAnimating,
        'is-replay-ready': card.canReplay,
        'is-offscreen': !card.isVisible,
        'is-ambient-frozen': card.isAmbientFrozen,
      }"
    >
      <div class="ellia-v2-magic-circle-layer">
        <div class="magic-ring r1"></div>
        <div class="magic-ring r2"></div>
        <div class="magic-symbol"></div>
      </div>
      <div class="ellia-v2-star-dust"></div>

      <div v-if="card.canReplay" class="ellia-v2-corner-controls">
        <span class="ellia-v2-replay-hint">Replay</span>
        <button class="ellia-v2-replay-button" type="button" @click.stop="replayCard(card.id)">↻</button>
      </div>

      <div class="ellia-v2-card-inner">
        <div class="ellia-v2-header ellia-v2-trigger" @mouseenter="requestPlay(card.id)" @click="activateCard(card.id)">
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

        <div :ref="element => setContentRef(card.id, element)" class="ellia-v2-content text">
          <div v-for="(line, index) in card.lines" :key="`${card.id}-${line.type}-${index}`" class="ellia-v2-line">
            <span v-if="line.type === 'action'" class="ellia-v2-action">{{ line.text }}</span>
            <template v-else>{{ line.text }}</template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';
import type { ComponentPublicInstance } from 'vue';
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

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
  hasPendingReplayHint: boolean;
  isAmbientFrozen: boolean;
}

type TokenKind = 'plain' | 'ellipsis' | 'comma' | 'period' | 'question' | 'exclaim' | 'colon' | 'phrase';
type FontMode = 'A' | 'B' | 'C' | 'D' | 'E';

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

const RHYTHM = {
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
const ACTIVE_ASSISTANT_MESSAGE_WINDOW = 3;

const cards = ref<ElliaCard[]>([]);
const fontMode = ref<FontMode>('A');
const contentRefs = new Map<string, HTMLElement>();
const cardRefs = new Map<string, HTMLElement>();
const timelineMap = new Map<string, gsap.core.Timeline>();
let intersectionObserver: IntersectionObserver | null = null;

function getConfiguredFontMode(): FontMode {
  const configuredMode = (document.body.dataset.elliaFont ?? 'A').toUpperCase();
  return FONT_MODES.includes(configuredMode as FontMode) ? (configuredMode as FontMode) : 'A';
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
    hasPendingReplayHint: false,
    isAmbientFrozen: false,
  };
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

function getElliaRegistryStore(): Record<string, ElliaInstanceRegistryEntry> {
  const hostWindow = window.parent as Window &
    typeof globalThis & {
      __ELLIA_INSTANCE_REGISTRY__?: Record<string, ElliaInstanceRegistryEntry>;
    };

  hostWindow.__ELLIA_INSTANCE_REGISTRY__ ??= {};
  return hostWindow.__ELLIA_INSTANCE_REGISTRY__;
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
  return nextIndex;
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
  const advance = options.advance ?? RHYTHM.baseAdvance;
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

function revealQuestionMark(timeline: gsap.core.Timeline, element: HTMLElement, cursor: number): number {
  return revealCharacter(timeline, element, cursor, {
    duration: 0.08,
    advance: RHYTHM.baseAdvance,
    hold: RHYTHM.punctuation.question,
    fromY: 1,
    fromScale: 0.98,
    ease: 'power2.out',
  });
}

function revealEllipsis(timeline: gsap.core.Timeline, dots: HTMLElement[], cursor: number): number {
  dots.forEach(dot => {
    cursor = revealCharacter(timeline, dot, cursor, {
      duration: RHYTHM.ellipsis.dotDuration,
      advance: RHYTHM.ellipsis.dotAdvance,
      hold: RHYTHM.ellipsis.dotHold,
      fromY: RHYTHM.ellipsis.dotFromY,
      fromScale: RHYTHM.ellipsis.dotFromScale,
      ease: 'back.out(1.3)',
    });
  });

  return cursor + RHYTHM.ellipsis.tailPause;
}

function schedulePlainToken(
  timeline: gsap.core.Timeline,
  spans: HTMLElement[],
  lineType: ParsedLine['type'],
  cursor: number,
  nextToken: LineToken | undefined,
): number {
  const span = spans[0];
  if (!span) {
    return cursor;
  }

  const char = span.textContent ?? '';
  const advance = lineType === 'action' ? RHYTHM.actionAdvance : RHYTHM.baseAdvance;
  const isInterjection = ['嗯', '呃', '啊', '噢', '诶', '嘿', '哼'].includes(char);
  const isParticleTail = ['呢', '啦', '嘛', '呀', '哦'].includes(char) && (!nextToken || nextToken.kind !== 'plain');
  let hold = 0;

  if (isInterjection) {
    hold = RHYTHM.phrase.tailPause;
  }

  if (isParticleTail) {
    hold = Math.max(hold, RHYTHM.phrase.particleTailPause);
  }

  return revealCharacter(timeline, span, cursor, {
    duration: 0.08,
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
): number {
  const span = spans[0];
  if (!span) {
    return cursor;
  }

  if (token.kind === 'question') {
    return revealQuestionMark(timeline, span, cursor);
  }

  const hold =
    token.kind === 'comma'
      ? RHYTHM.punctuation.comma
      : token.kind === 'period'
        ? RHYTHM.punctuation.period
        : token.kind === 'exclaim'
          ? RHYTHM.punctuation.exclaim
          : RHYTHM.punctuation.colon;

  return revealCharacter(timeline, span, cursor, {
    duration: 0.08,
    advance: RHYTHM.baseAdvance,
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
): number {
  const ellipsisMatch = token.text.match(/(\.\.\.|…+)$/);

  if (ellipsisMatch) {
    const prefixLength = Array.from(token.text.slice(0, -ellipsisMatch[0].length)).length;
    const prefixSpans = spans.slice(0, prefixLength);
    const ellipsisSpans = spans.slice(prefixLength);

    prefixSpans.forEach((span, index) => {
      cursor = revealCharacter(timeline, span, cursor, {
        duration: 0.08,
        advance: RHYTHM.baseAdvance,
        hold: index === prefixSpans.length - 1 ? RHYTHM.phrase.slowLeadHold : 0,
        fromY: 1.5,
        fromScale: 0.98,
        ease: 'power2.out',
      });
    });

    return revealEllipsis(timeline, ellipsisSpans, cursor);
  }

  spans.forEach(span => {
    cursor = revealCharacter(timeline, span, cursor, {
      duration: 0.08,
      advance: RHYTHM.baseAdvance,
      fromY: 1.5,
      fromScale: 0.98,
      ease: 'power2.out',
    });
  });

  return cursor + RHYTHM.phrase.tailPause;
}

function buildTimeline(cardId: string): gsap.core.Timeline | null {
  const preparedLines = rebuildCharacters(cardId);
  const card = getCard(cardId);
  if (!preparedLines.length || !card) {
    return null;
  }

  const timeline = gsap.timeline({
    paused: true,
    onComplete: () => {
      card.isAnimating = false;
      card.canReplay = true;
      card.hasPendingReplayHint = true;
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
        cursor = schedulePhraseToken(timeline, token, spans, cursor);
        return;
      }

      if (token.kind === 'ellipsis') {
        cursor = revealEllipsis(timeline, spans, cursor);
        return;
      }

      if (token.kind === 'plain') {
        cursor = schedulePlainToken(timeline, spans, line.type, cursor, nextToken);
        return;
      }

      cursor = schedulePunctuationToken(timeline, token, spans, cursor);
    });

    if (lineIndex < preparedLines.length - 1) {
      cursor += RHYTHM.lineGap;
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
  card.hasPendingReplayHint = showReplayHint;
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

  const timeline = buildTimeline(cardId);
  if (!timeline) {
    return;
  }

  card.isAnimating = true;
  card.hasPlayed = true;
  card.canReplay = false;
  card.hasPendingReplayHint = false;

  timelineMap.set(cardId, timeline);
  timeline.play(0);
}

function requestPlay(cardId: string) {
  startAnimation(cardId, false);
}

function activateCard(cardId: string) {
  const card = getCard(cardId);
  if (!card) {
    return;
  }

  startAnimation(cardId, card.hasPlayed);
}

function replayCard(cardId: string) {
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
  fontMode.value = getConfiguredFontMode();

  const message = getChatMessages(getCurrentMessageId())[0]?.message ?? '';
  const blockIndex = getCurrentElliaBlockIndex(message);
  const card = parseCurrentElliaBlock(message, blockIndex);
  cards.value = card ? [card] : [];

  if (!cards.value.length) {
    console.warn('未在当前消息中找到符合条件的 <ellia> 标签');
    return;
  }

  await nextTick();
  cards.value.forEach(cardItem => renderStaticText(cardItem.id));
  setupIntersectionObserver();
}

onMounted(() => {
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

.ellia-v2-bridge-slot {
  display: contents;
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
  overflow: hidden;
  transition:
    border-color 0.35s ease,
    box-shadow 0.35s ease,
    opacity 0.35s ease;
  isolation: isolate;
  contain: paint;
  clear: both;
}

.ellia-v2-container:hover,
.ellia-v2-container.is-animating {
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
.ellia-v2-container.is-animating .ellia-v2-magic-circle-layer {
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
  padding: 12px 18px;
  z-index: 2;
}

.ellia-v2-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.25rem;
}

.ellia-v2-trigger {
  cursor: pointer;
  touch-action: manipulation;
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
.ellia-v2-container.is-animating .v2-eye-ball {
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
.ellia-v2-container.is-animating .ellia-v2-header-line {
  background: linear-gradient(90deg, var(--e-accent), transparent);
  box-shadow: 0 0 5px var(--e-main);
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
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.ellia-v2-replay-hint {
  color: rgba(224, 176, 255, 0.92);
  font-size: 0.72em;
  text-shadow: 0 0 6px rgba(155, 89, 182, 0.55);
}

.ellia-v2-replay-button {
  width: 26px;
  height: 26px;
  border: 1px solid rgba(224, 176, 255, 0.8);
  border-radius: 999px;
  background: rgba(46, 16, 53, 0.86);
  color: #f4ddff;
  font-size: 0.92rem;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(155, 89, 182, 0.25);
}

.ellia-v2-replay-button:hover {
  background: rgba(78, 30, 91, 0.92);
  box-shadow: 0 0 16px rgba(224, 176, 255, 0.35);
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
</style>
