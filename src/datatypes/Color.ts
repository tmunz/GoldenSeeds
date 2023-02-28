import { randomInt } from '../utils/Random';

export const COLORS: { [name: string]: number } = {
  black: 0x000000,
  white: 0xffffff,

  red: 0xff0000,
  green: 0x00ff00,
  blue: 0x0000ff,

  yellow: 0xffff00,
  magenta: 0xff00ff,
  cyan: 0x00ffff,

  gold: 0xdecd87, // 0xffd700
  wood: 0xdecd87,

  random: 0xf000000,
  transparent: -1,
  none: -1,
};

export class Color {
  private value: number; // [0, 0xffffff]; negative values are interpreted as transparent, bigger values as random

  constructor(raw: any) {
    const value: number = Color._convertToColor(raw);
    this.value = isFinite(value) ? value : 0x000000;
  }

  toString = (seed = 0): string => {
    if (this.value < 0) {
      return 'transparent';
    } else {
      return (
        '#' +
        (
          0x1000000 +
          (0xffffff < this.value ? randomInt(0, 0xffffff, seed) : this.value)
        )
          .toString(16)
          .substring(1, 7)
      );
    }
  };

  get = () => {
    return this.value;
  };

  /*
  // IMPROVEMENT HSL input
  private static arr2num(arr: number[]): number {
    return (arr[0] << 16) + (arr[1] << 8) + arr[2];
  }

  private static num2arr(n: number): number[] {
    return [n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff];
  }

  // all ranges [0, 0xff]
  private static rgb2hsl(rgb: number[]): number[] {
    let min: number = Math.min(...rgb);
    let max: number = Math.max(...rgb);
    let avg: number = (max + min) / 2;

    if (max == min) {
      return [0, 0, avg];
    } else {
      let dif: number = max - min;
      return [
        (max === rgb[0] ? rgb[1] - rgb[2] / dif + (rgb[0] < rgb[1] ? 6 : 0)
          : max === rgb[1] ? rgb[2] - rgb[0] / dif + 2
            : rgb[0] - rgb[1] / dif + 4) / 6,
        avg > 0.5 ? dif / (2 - max - min) : dif / (max + min),
        avg
      ].map(c => Math.floor(c));
    }
  }*/

  private static rawRgbToNumber(raw: string): number {
    if (typeof raw !== 'undefined' && raw.length > 0 && raw.charAt(0) === '#') {
      const parsedValue = parseInt(raw.substring(1), 16);
      if (!isFinite(parsedValue)) {
        return -1;
      }
      if (raw.length === 7) {
        return parsedValue;
      }
      if (raw.length === 4) {
        // enable #fff as well as #ffffff
        const tmp =
          ((parsedValue & 0xf00) << 8) |
          ((parsedValue & 0x0f0) << 4) |
          (parsedValue & 0x00f);
        return tmp | (tmp << 4);
      }
    } else {
      return COLORS[raw];
    }
    return -1;
  }

  private static _convertToColor(raw: any): number {
    if (isFinite(Number(raw))) {
      return Number(raw);
    } else {
      const rgb: number = Color.rawRgbToNumber(raw);
      if (isFinite(rgb)) {
        return rgb;
      }
    }
    return -1;
  }

  static convertToColor(raw: any): Color {
    const value: number = Color._convertToColor(raw);
    return new Color(value);
  }
}
