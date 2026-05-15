import type { ElliaCard, ElliaInstanceRegistryEntry, ParsedLine } from './types';

export function stripThinkingContent(message: string): string {
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

export function parseLines(rawText: string): ParsedLine[] {
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

export function createElliaCard(attrText: string, rawBody: string, index: number): ElliaCard | null {
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

export function getCurrentElliaBlockIndex(message: string): number {
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

export function parseCurrentElliaBlock(message: string, blockIndex: number): ElliaCard | null {
  const visibleMessage = stripThinkingContent(message);
  const matches = Array.from(visibleMessage.matchAll(/<ellia\b([^>]*)>([\s\S]*?)<\/ellia>/g));
  const match = matches[blockIndex];
  if (!match) {
    return null;
  }

  return createElliaCard(match[1] ?? '', match[2] ?? '', blockIndex);
}
