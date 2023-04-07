import { randomColor } from '../utils/Random';

export class Color {
  red: number = 0;
  green: number = 0;
  blue: number = 0;
  alpha: number = 1;
  random: boolean = false;

  constructor(value: { r: number, g: number, b: number, a?: number, random?: boolean } | string) {
    if (typeof value === 'string') {
      this.fromRaw(value);
    } else {
      this.red = value.r;
      this.green = value.g;
      this.blue = value.b;
      this.alpha = value.a !== undefined ? value.a : 1;
      this.random = value.random ?? false;
    }
  }

  toRgbHex(seed = 0): string {
    if (this.alpha === 0) {
      return 'none';
    } else if (this.random) {
      return '#' + (0xf000000 | randomColor(seed)).toString(16).substring(1, 7);
    } else {
      return '#' + (0xf000000 | this.red << 16 | this.green << 8 | this.blue).toString(16).substring(1, 7);
    }
  };

  toRgba(): { r: number, g: number, b: number, a?: number } {
    return { r: this.red, g: this.green, b: this.blue, a: this.alpha };
  }

  fromRaw(raw: string): Color {
    const value = COLORS[raw];
    if (value !== undefined) {
      if (value.r !== undefined) {
        this.red = value.r;
      }
      if (value.g !== undefined) {
        this.green = value.g;
      }
      if (value.b !== undefined) {
        this.blue = value.b;
      }
      if (value.a !== undefined) {
        this.alpha = value.a;
      }
      this.random = value.random ?? false;
    } else if (typeof raw !== 'undefined' && raw.length > 0 && raw.charAt(0) === '#') {
      const parsedValue = parseInt(raw.substring(1), 16);
      if (isFinite(parsedValue)) {
        if (raw.length === 7) {
          this.red = 0xff & parsedValue >> 16;
          this.green = 0xff & parsedValue >> 8;
          this.blue = 0xff & parsedValue;
        }
        else if (raw.length === 4) {
          // enable #fff as well as #ffffff
          this.red = 0xff & parsedValue >> 8;
          this.green = 0xff & parsedValue >> 4;
          this.blue = 0xff & parsedValue;
        }
      }
    } else if (raw.slice(0, 2) === '0x' && raw.length === 11 && isFinite(Number(raw))) {
      this.red = Number(`0x${raw.slice(5, 7)}`);
      this.green = Number(`0x${raw.slice(7, 9)}`);
      this.blue = Number(`0x${raw.slice(9, 11)}`);
      this.alpha = Number(`0x${raw.slice(3, 5)}`) / 255;
      this.random = raw.slice(2, 3) === '1';
    }
    return this;
  }

  toRaw(): string {
    const a = 0xff & Math.round(this.alpha * 255);
    const random = this.random ? 0x1 : 0x0;
    return `0x${random}${a.toString(16).padStart(2, '0')}${this.toRgbHex().replace('#', '')}`;
  }
}

export const COLORS: Record<string, { r?: number, g?: number, b?: number, a?: number, random?: boolean }> = {
  black: { r: 0x00, g: 0x00, b: 0x00 },
  white: { r: 0xff, g: 0xff, b: 0xff },

  red: { r: 0xff, g: 0x00, b: 0x00 },
  green: { r: 0x00, g: 0xff, b: 0x00 },
  blue: { r: 0x00, g: 0x00, b: 0xff },

  yellow: { r: 0xff, g: 0xff, b: 0x00 },
  magenta: { r: 0xff, g: 0x00, b: 0xff },
  cyan: { r: 0x00, g: 0xff, b: 0xff },

  gold: { r: 0xde, g: 0xcd, b: 0x87 }, // 0xffd700
  patina: { r: 0xbc, g: 0xde, b: 0x87 },

  random: { random: true },
  transparent: { a: 0 },
  none: { a: 0 },
};
