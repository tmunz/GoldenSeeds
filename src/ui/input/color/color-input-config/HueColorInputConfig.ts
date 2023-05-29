import { ColorInputConfig } from "./ColorInputConfig";

export const HueColorInputConfig: ColorInputConfig = {
  name: 'h',
  unit: '°',
  min: 0,
  max: 360,
  base: 10,
  gradient: [
    { h: 0, s: 100, l: 50 }, { h: 60, s: 100, l: 50 },
    { h: 120, s: 100, l: 50 }, { h: 180, s: 100, l: 50 },
    { h: 240, s: 100, l: 50 }, { h: 300, s: 100, l: 50 },
    { h: 0, s: 100, l: 50 },
  ],
};
