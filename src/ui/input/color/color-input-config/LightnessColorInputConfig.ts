import { ColorInputConfig } from "./ColorInputConfig";

export const LightnessColorInputConfig: ColorInputConfig = {
  name: 'l',
  unit: '%',
  min: 0,
  max: 100,
  base: 10,
  gradient: [{ h: 0, s: 0, l: 0 }, { h: 0, s: 0, l: 100 }],
};
