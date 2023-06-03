import { ColorInputConfig } from "./ColorInputConfig";

export const SaturationColorInputConfig: ColorInputConfig = {
  name: 's',
  unit: '%',
  min: 0,
  max: 100,
  base: 10,
  gradient: [{ s: 0 }, { s: 100 }],
};
