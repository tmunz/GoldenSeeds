import { ColorInputConfig } from "./ColorInputConfig";

export const AlphaColorInputConfig: ColorInputConfig = {
  name: 'a',
  unit: '%',
  min: 0,
  max: 100,
  base: 10,
  gradient: [{ r: 0, g: 0, b: 0, a: 0 }, { r: 0, g: 0, b: 0, a: 100 }],
};
