import type { MessageScope, RuntimeHelper } from './types';

function parseMessageId(value: unknown): number | null {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function readMessageIdFromElement(element: Element | null | undefined): number | null {
  if (!element || typeof element.closest !== 'function') return null;

  const messageElement = element.closest(
    '.mes[mesid], [mesid], [data-message-id], [data-mes-id], [data-message_id], [data-messageid]',
  );
  if (!messageElement) return null;

  for (const attrName of ['mesid', 'data-message-id', 'data-mes-id', 'data-message_id', 'data-messageid']) {
    const id = parseMessageId(messageElement.getAttribute(attrName));
    if (id !== null) return id;
  }
  return null;
}

export function resolveMessageId(root: HTMLElement, helper: RuntimeHelper): number | null {
  const directId = readMessageIdFromElement(root);
  if (directId !== null) return directId;

  const frame = window.frameElement;
  const frameId = readMessageIdFromElement(frame);
  if (frameId !== null) return frameId;

  const frameName = String(frame?.getAttribute?.('name') || frame?.id || '');
  const nameId = parseMessageId(frameName.match(/(?:mes|message|iframe)[_-]?(\d+)/i)?.[1]);
  if (nameId !== null) return nameId;

  const currentWindow = window as Window & RuntimeHelper;
  let parentGetter: (() => unknown) | undefined;
  try {
    parentGetter = (window.parent as Window & RuntimeHelper | undefined)?.getCurrentMessageId;
  } catch (_) {
    parentGetter = undefined;
  }

  for (const getter of [helper.getCurrentMessageId, currentWindow.getCurrentMessageId, parentGetter]) {
    if (!getter) continue;
    try {
      const id = parseMessageId(getter.call(window.parent || window));
      if (id !== null) return id;
    } catch (_) {}
  }
  return null;
}

export function resolveMessageScope(root: HTMLElement, helper: RuntimeHelper): MessageScope | null {
  const messageId = resolveMessageId(root, helper);
  return messageId === null ? null : { type: 'message', message_id: messageId };
}
