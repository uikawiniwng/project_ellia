type RgbColor = {
  r: number;
  g: number;
  b: number;
};

type HslColor = {
  h: number;
  s: number;
  l: number;
};

function parseColor(value: string): RgbColor | null {
  const color = value.trim();
  if (!color) return null;

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) {
    let hex = color.slice(1);
    if (hex.length === 3) hex = hex.split('').map(char => char + char).join('');
    const numeric = Number.parseInt(hex, 16);
    return { r: (numeric >> 16) & 255, g: (numeric >> 8) & 255, b: numeric & 255 };
  }

  const rgbMatch = color.match(/^rgba?\(([^)]+)\)$/i);
  if (!rgbMatch) return null;

  const parts = rgbMatch[1].split(',').map(part => Number.parseFloat(part.trim()));
  if (parts.length < 3 || parts.slice(0, 3).some(part => !Number.isFinite(part))) return null;

  return {
    r: Math.max(0, Math.min(255, parts[0])),
    g: Math.max(0, Math.min(255, parts[1])),
    b: Math.max(0, Math.min(255, parts[2])),
  };
}

function rgbToHsl(color: RgbColor): HslColor {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: l * 100 };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
      break;
  }

  return { h: h * 60, s: s * 100, l: l * 100 };
}

function hslToRgb(color: HslColor): RgbColor {
  const s = color.s / 100;
  const l = color.l / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hh = (((color.h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hh < 1) {
    r1 = c;
    g1 = x;
  } else if (hh < 2) {
    r1 = x;
    g1 = c;
  } else if (hh < 3) {
    g1 = c;
    b1 = x;
  } else if (hh < 4) {
    g1 = x;
    b1 = c;
  } else if (hh < 5) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }

  const m = l - c / 2;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function rgbToHex(color: RgbColor): string {
  return (
    '#' +
    [color.r, color.g, color.b]
      .map(value => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0'))
      .join('')
  );
}

function hueDistance(left: number, right: number): number {
  return Math.min(Math.abs(left - right), 360 - Math.abs(left - right));
}

export function applySafeTheme(front: HTMLElement | null, themeRaw: string): void {
  if (!front) return;

  const rgb = parseColor(themeRaw);
  if (!rgb) return;

  const hsl = rgbToHsl(rgb);
  const tooCloseToBase = hueDistance(hsl.h, 300) < 28 && hsl.s < 25 && hsl.l > 78;
  const safe = tooCloseToBase
    ? { h: (hsl.h + 95) % 360, s: Math.max(38, hsl.s + 28), l: Math.min(52, hsl.l - 36) }
    : hsl;
  const soft = { h: safe.h, s: Math.max(18, safe.s - 20), l: Math.min(82, safe.l + 24) };

  front.style.setProperty('--theme-safe', rgbToHex(hslToRgb(safe)));
  front.style.setProperty('--theme-soft', rgbToHex(hslToRgb(soft)));
}
