import { BehaviorSubject } from 'rxjs';
import { random } from '../utils/Random';

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

  constructor(colorValue?: ColorValue | Color) {
    this.textValue$.subscribe(v => this.rgba = Color.textToRgba(v));
    if (colorValue !== undefined) {
      if (colorValue instanceof Color) {
        this.setTextValue(colorValue.getAcn());
      } else if (typeof colorValue === 'string') {
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
    return this.rgba || Color.hslaToRgba(ColorRecord.black);
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

  withRandom(random = true): this {
    this.random = random;
    return this;
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
    const rand = /*random() % 1*/ Math.abs(Math.sin(seed + 5)) % 1;
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
    const colorRecord = ColorRecord[namedColor];
    return colorRecord ? Color.hslaToRgba(colorRecord) : null;
  }

  static rgbaToAcn(rgba: RgbaColor, random: boolean = false): string {
    const a = 0xff & Math.round((rgba.a === undefined ? 1 : rgba.a) * 255);
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
    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a === undefined ? 1 : rgba.a})`;
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
      const k = (channel * 4 + hsla.h / 30) % 12;
      const m = hsla.s / 100 * Math.min(hsla.l / 100, 1 - hsla.l / 100);
      return (hsla.l / 100 - m * Math.max(Math.min(k - 3, 9 - k, 1), -1)) * 0xff;
    }
    return { r: toRgb(0), g: toRgb(2), b: toRgb(1), a: hsla.a };
  }
}

export const ColorRecord: Record<string, HslaColor> = {
  black: { h: 0, s: 0, l: 0, a: 1 },
  darkgray: { h: 0, s: 0, l: 25, a: 1 },
  gray: { h: 0, s: 0, l: 50, a: 1 },
  lightgray: { h: 0, s: 0, l: 74, a: 1 },
  white: { h: 0, s: 0, l: 100, a: 1 },

  red: { h: 0, s: 100, l: 50, a: 1 },
  orange: { h: 30, s: 100, l: 50, a: 1 },
  yellow: { h: 60, s: 100, l: 50, a: 1 },
  lime: { h: 90, s: 100, l: 50, a: 1 },
  green: { h: 120, s: 100, l: 50, a: 1 },
  spring: { h: 150, s: 100, l: 50, a: 1 },
  cyan: { h: 180, s: 100, l: 50, a: 1 },
  brescian: { h: 210, s: 100, l: 50, a: 1 },
  blue: { h: 240, s: 100, l: 50, a: 1 },
  purple: { h: 270, s: 100, l: 50, a: 1 },
  magenta: { h: 300, s: 100, l: 50, a: 1 },
  neonrose: { h: 330, s: 100, l: 50, a: 1 },

  gold: { h: 48, s: 57, l: 70, a: 1 }, // 0xdecd87 0xffd700
  patina: { h: 83, s: 57, l: 70, a: 1 }, // 0xbcde87
  pastelblue: { h: 200, s: 57, l: 70, a: 1 },
  pastelviolet: { h: 288, s: 57, l: 70, a: 1 },

  darkOrange: { h: 20, s: 100, l: 40 },
  britishRacing: { h: 154, s: 100, l: 13},
  marian: {h: 225, s: 55, l: 37},
  coral: { h: 16, s: 100, l: 66 },

  transparent: { h: 0, s: 0, l: 0, a: 0 },
  none: { h: 0, s: 0, l: 0, a: 0 },
};
