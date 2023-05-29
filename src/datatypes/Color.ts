import { BehaviorSubject } from 'rxjs';

export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a?: number | undefined;
}

export interface HslaColor {
  h: number;
  s: number;
  l: number;
  a?: number | undefined;
}

export type ColorValue = string | RgbaColor | HslaColor;

export class Color {

  private random = false;
  private textValue$ = new BehaviorSubject<string>('black');
  private rgba: RgbaColor | null = null;

  constructor(colorValue?: ColorValue) {
    this.textValue$.subscribe(v => this.rgba = Color.textToRgba(v));
    if (colorValue !== undefined) {
      if (typeof colorValue === 'string') {
        this.setTextValue(colorValue);
      } else if ('r' in colorValue && 'g' in colorValue && 'b' in colorValue) {
        this.setTextValue(Color.rgbaToAcn(colorValue));
      } else if ('h' in colorValue && 's' in colorValue && 'l' in colorValue) {
        this.setTextValue(Color.hslaToAcn(colorValue));
      }
    }
  }

  setTextValue(v: string): Color {
    this.random = v.toLowerCase() === 'random' || v.slice(0, 3) === '0x1';
    this.textValue$.next(v);
    return this;
  }

  getTextValue(): string {
    return this.textValue$.value;
  }

  getRgba(): RgbaColor {
    return this.rgba || ColorRecord.black;
  }

  getHsla(): HslaColor {
    return Color.rgbaToHsla(this.getRgba());
  }

  getRgbString(seed = 0): string {
    if (this.getRgba().a === 0) {
      return 'none';
    } else {
      return Color.rgbToString(this.random ? Color.randomColor(seed) : this.getRgba());
    }
  }

  getRgbaString(seed = 0): string {
    return Color.rgbaToString(this.random ? Color.randomColor(seed) : this.getRgba());
  }

  getAcn(): string {
    return Color.rgbaToAcn(this.getRgba(), this.random);
  }

  isRandom(): boolean {
    return this.random;
  }

  setRandom(random = true): void {
    this.random = random;
  }

  // range 0..1
  getOpacity(): number {
    return this.getRgba().a ?? 1;
  }

  isValid(): boolean {
    return this.rgba !== null;
  }

  static randomColor(seed: number): RgbaColor {
    const max = 0xffffff;
    const rand = Math.abs(Math.sin(seed + 5)) % 1;
    const c = Math.floor(rand * max + 1);
    return { r: 0xff & (c >> (16)), g: 0xff & (c >> (8)), b: 0xff & c };
  };

  static textToRgba(s: string): RgbaColor | null {
    return Color.namedColorToRgba(s) || Color.textValueToRgba(s) || Color.acnToRgba(s);
  }

  static textValueToRgba(s: string): RgbaColor | null {
    if (s.charAt(0) === '#') {
      const parsedValue = parseInt(s.substring(1), 16);
      if (isFinite(parsedValue)) {
        const m = s.length < 6 ? 1 : 2;
        return { r: 0xff & (parsedValue >> (8 * m)), g: 0xff & (parsedValue >> (4 * m)), b: 0xff & parsedValue };
      }
    }
    return null;
  }

  static namedColorToRgba(namedColor: string): RgbaColor | null {
    return ColorRecord[namedColor] ?? null;
  }

  static rgbaToAcn(rgba: RgbaColor, random: boolean = false): string {
    const a = 0xff & Math.round((rgba.a ?? 1) * 255);
    const randomFlag = random ? 0x1 : 0x0;
    return `0x${randomFlag}${a.toString(16).padStart(2, '0')}${Color.rgbToString(rgba).replace('#', '')}`;
  }

  static hslaToAcn(hsla: HslaColor, random?: boolean): string {
    return Color.rgbaToAcn(Color.hslaToRgba(hsla), random);
  }

  static rgbToString(rgb: RgbaColor): string {
    return '#' + (0xf000000 | (Math.round(rgb.r) << 16) | (Math.round(rgb.g) << 8) | Math.round(rgb.b)).toString(16).substring(1, 7);
  }

  static rgbaToString(rgba: RgbaColor): string {
    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
  }

  static acnToRgba(acn: string): RgbaColor | null {
    if (acn.slice(0, 2) === '0x' && acn.length === 11 && isFinite(Number(acn))) {
      return {
        r: Number(`0x${acn.slice(5, 7)}`),
        g: Number(`0x${acn.slice(7, 9)}`),
        b: Number(`0x${acn.slice(9, 11)}`),
        a: Number(`0x${acn.slice(3, 5)}`) / 255,
      };
    }
    return null;
  }

  static rgbaToHsla(rgba: RgbaColor): HslaColor {
    const r = rgba.r / 0xFF;
    const g = rgba.g / 0xFF;
    const b = rgba.b / 0xFF;
    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s ? l === r ? (g - b) / s : l === g ? 2 + (b - r) / s : 4 + (r - g) / s : 0;
    return {
      h: (60 * h + 360) % 360,
      s: 100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
      l: (100 * (2 * l - s)) / 2,
      a: rgba.a,
    }
  }

  static hslaToRgba(hsla: HslaColor): RgbaColor {
    const toRgb = (channel: number) => {
      const a = hsla.s / 100 * Math.min(hsla.l / 100, 1 - hsla.l / 100);
      const k = (channel * 4 + hsla.h / 30) % 12;
      return (hsla.l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)) * 0xff;
    }
    return { r: toRgb(0), g: toRgb(2), b: toRgb(1), a: hsla.a };
  }
}

export const ColorRecord: Record<string, RgbaColor> = {
  black: { r: 0x00, g: 0x00, b: 0x00, a: 1 },
  white: { r: 0xff, g: 0xff, b: 0xff, a: 1 },

  red: { r: 0xff, g: 0x00, b: 0x00, a: 1 },
  green: { r: 0x00, g: 0xff, b: 0x00, a: 1 },
  blue: { r: 0x00, g: 0x00, b: 0xff, a: 1 },

  yellow: { r: 0xff, g: 0xff, b: 0x00, a: 1 },
  magenta: { r: 0xff, g: 0x00, b: 0xff, a: 1 },
  cyan: { r: 0x00, g: 0xff, b: 0xff, a: 1 },

  gold: { r: 0xde, g: 0xcd, b: 0x87, a: 1 }, // 0xffd700
  patina: { r: 0xbc, g: 0xde, b: 0x87, a: 1 },

  transparent: { r: 0, g: 0, b: 0, a: 0 },
  none: { r: 0, g: 0, b: 0, a: 0 },
};
