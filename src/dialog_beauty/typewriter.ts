import { gsap } from 'gsap';
import { BASE_RHYTHM, PHRASE_PATTERNS } from './constants';
import type {
  ElliaCard,
  LineToken,
  ParsedLine,
  PreparedLine,
  RevealOptions,
  RhythmProfile,
  TokenKind,
  TypewriterSpeed,
} from './types';

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

export function renderStaticText(contentElement: HTMLElement, card: ElliaCard) {
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

function rebuildCharacters(contentElement: HTMLElement, card: ElliaCard): PreparedLine[] {
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
    const chars = [];

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

export function buildTypewriterTimeline(
  card: ElliaCard,
  contentElement: HTMLElement,
  speed: Exclude<TypewriterSpeed, 'disable'>,
  onComplete: () => void,
): gsap.core.Timeline | null {
  const preparedLines = rebuildCharacters(contentElement, card);
  if (!preparedLines.length) {
    return null;
  }

  const rhythm = createRhythmProfile(speed);
  const timeline = gsap.timeline({
    paused: true,
    onComplete,
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
