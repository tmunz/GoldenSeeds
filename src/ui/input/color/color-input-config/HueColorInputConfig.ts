import { ColorInputConfig } from "./ColorInputConfig";

export const HueColorInputConfig: ColorInputConfig = {
  name: 'h',
  unit: '°',
  min: 0,
  max: 360,
  base: 10,
  gradient: [0, 60, 120, 180, 240, 300, 0].map(h => ({ h, /*s: 100, l: 50*/ })),
};
