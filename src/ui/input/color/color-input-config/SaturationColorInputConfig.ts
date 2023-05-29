import { ColorInputConfig } from "./ColorInputConfig";

export const SaturationColorInputConfig: ColorInputConfig = {
  name: 's',
  unit: '%',
  min: 0,
  max: 100,
  base: 10,
  gradient: [{ h: 0, s: 0, l: 50 }, { h: 0, s: 100, l: 50 }],
};
