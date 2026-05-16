import type { RuntimeHelper, ToastType } from './types';

type ToastElement = HTMLElement & {
  _ticketTimer?: ReturnType<typeof setTimeout>;
};

export function getRuntimeHelper(): RuntimeHelper {
  const currentWindow = window as Window & RuntimeHelper;
  try {
    const parentWindow = window.parent as (Window & RuntimeHelper) | undefined;
    return window.TavernHelper ?? parentWindow?.TavernHelper ?? currentWindow;
  } catch (_) {
    return window.TavernHelper ?? currentWindow;
  }
}

export function findTicketRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.et-layout-wrap-v9');
}

export function showToast(toast: HTMLElement | null, message: string, type: ToastType = 'info', duration = 2400): void {
  if (!toast) return;

  const toastElement = toast as ToastElement;
  toastElement.textContent = message;
  toastElement.className = `et-import-toast-v9 show ${type}`;
  clearTimeout(toastElement._ticketTimer);
  toastElement._ticketTimer = setTimeout(() => {
    toastElement.className = 'et-import-toast-v9';
  }, duration);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function clonePlain(value: unknown): Record<string, unknown> {
  if (!isPlainObject(value)) return {};

  try {
    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  } catch (_) {
    return { ...value };
  }
}

export function mergePlain(target: unknown, patch: Record<string, unknown>): Record<string, unknown> {
  const output = clonePlain(target);
  Object.keys(patch).forEach(key => {
    const value = patch[key];
    output[key] = isPlainObject(value) && isPlainObject(output[key]) ? mergePlain(output[key], value) : value;
  });
  return output;
}

export function getByPath(source: unknown, path: string): unknown {
  return path
    .split('.')
    .filter(Boolean)
    .reduce<unknown>((current, key) => (isPlainObject(current) ? current[key] : undefined), source);
}
