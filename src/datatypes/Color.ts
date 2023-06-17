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
  private hsla: HslaColor | null = null;

  constructor(colorValue?: ColorValue | Color) {
    this.textValue$.subscribe(v => {
      this.hsla = Color.textToHsla(v);
      this.rgba = Color.textToRgba(v);
    });
    this.setValue(colorValue);
  }

  setValue(colorValue?: ColorValue | Color): Color {
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
    return this;
  }

  setTextValue(v: string): Color {
    this.random = v.toLowerCase() === 'random' || v.slice(0, 2) === '_1';
    this.textValue$.next(v);
    return this;
  }

  getTextValue(): string {
    return this.textValue$.value;
  }

  getRgba(): RgbaColor {
    return this.rgba ?? Color.hslaToRgba(ColorRecord.black);
  }

  getHsla(): HslaColor {
    return this.hsla ?? ColorRecord.black;
  }

  getRgbString(seed = 0): string {
    if (this.rgba?.a === 0) {
      return 'none';
    } else {
      return Color.rgbToString(this.random ? Color.randomColor(seed) : this.getRgba());
    }
  }

  getRgbaString(seed = 0): string {
    return Color.rgbaToString(this.random ? Color.randomColor(seed) : this.getRgba());
  }

  getAcn(): string {
    return Color.hslaToAcn(this.getHsla(), this.random);
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
    return this.hsla !== null && this.rgba !== null;
  }

  static randomColor(seed: number): RgbaColor {
    const max = 0xffffff;
    const rand = /*random() % 1*/ Math.abs(Math.sin(seed + 5)) % 1;
    const c = Math.floor(rand * max + 1);
    return { r: 0xff & (c >> (16)), g: 0xff & (c >> (8)), b: 0xff & c };
  }

  static textToHsla(s: string): HslaColor | null {
    const rgbaTextValue = Color.textValueToRgba(s);
    return Color.namedColorToHsla(s) || (rgbaTextValue && Color.rgbaToHsla(rgbaTextValue)) || Color.acnToHsla(s);
  }

  static textToRgba(s: string): RgbaColor | null {
    const namedColorHsla = Color.namedColorToHsla(s);
    const acnHsla = Color.acnToHsla(s);
    return (namedColorHsla && Color.hslaToRgba(namedColorHsla)) || Color.textValueToRgba(s) || (acnHsla && Color.hslaToRgba(acnHsla));
  }

  static textValueToRgba(s: string): RgbaColor | null {
    const parsedValue = parseInt(s.replace('#', ''), 16);
    if (isFinite(parsedValue)) {
      const m = s.length < 6 ? 1 : 2;
      return { r: 0xff & (parsedValue >> (8 * m)), g: 0xff & (parsedValue >> (4 * m)), b: 0xff & parsedValue };
    }
    return null;
  }

  static namedColorToHsla(namedColor: string): HslaColor | null {
    return ColorRecord[namedColor] ?? null;
  }

  static rgbToString(rgb: RgbaColor): string {
    return '#' + (0xf000000 | (Math.round(rgb.r) << 16) | (Math.round(rgb.g) << 8) | Math.round(rgb.b)).toString(16).substring(1, 7);
  }

  static rgbaToString(rgba: RgbaColor): string {
    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a === undefined ? 1 : rgba.a})`;
  }

  static rgbaToAcn(rgba: RgbaColor, random = false): string {
    return Color.hslaToAcn(Color.rgbaToHsla(rgba), random);
  }

  static hslaToAcn(hsla: HslaColor, random?: boolean): string {
    const h = Math.round(hsla.h * 3.597).toString(36);
    const s = Math.round(hsla.s * 12.95).toString(36);
    const l = Math.round(hsla.l * 12.95).toString(36);
    const a = Math.round((hsla.a === undefined ? 1 : hsla.a) * 1295).toString(36);
    return `_${random ? 1 : 0}${a.padStart(2, '0')}${h.padStart(2, '0')}${s.padStart(2, '0')}${l.padStart(2, '0')}`;
  }

  static acnToHsla(acn: string): HslaColor | null {
    let hsla = null
    if (acn.slice(0, 1) === '_' && acn.length === 10 && isFinite(Number.parseInt(acn.substring(1, 10), 36))) {
      hsla = {
        h: Number.parseInt(acn.slice(4, 6), 36) / 3.597,
        s: Number.parseInt(acn.slice(6, 8), 36) / 12.95,
        l: Number.parseInt(acn.slice(8, 10), 36) / 12.95,
        a: Number.parseInt(acn.slice(2, 4), 36) / 1295,
      };
    }
    return hsla;
  }

  static rgbaToHsla(rgba: RgbaColor): HslaColor {
    const r = rgba.r / 0xff;
    const g = rgba.g / 0xff;
    const b = rgba.b / 0xff;
    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s ? l === r ? (g - b) / s : l === g ? 2 + (b - r) / s : 4 + (r - g) / s : 0;
    return {
      h: (60 * h + 360) % 360,
      s: 100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
      l: (100 * (2 * l - s)) / 2,
      a: rgba.a,
    };
  }

  static hslaToRgba(hsla: HslaColor): RgbaColor {
    const toRgb = (channel: number) => {
      const k = (channel * 4 + hsla.h / 30) % 12;
      const m = hsla.s / 100 * Math.min(hsla.l / 100, 1 - hsla.l / 100);
      return (hsla.l / 100 - m * Math.max(Math.min(k - 3, 9 - k, 1), -1)) * 0xff;
    };
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
  britishRacing: { h: 154, s: 100, l: 13 },
  marian: { h: 225, s: 55, l: 37 },
  coral: { h: 16, s: 100, l: 66 },

  transparent: { h: 0, s: 0, l: 0, a: 0 },
  none: { h: 0, s: 0, l: 0, a: 0 },
};
