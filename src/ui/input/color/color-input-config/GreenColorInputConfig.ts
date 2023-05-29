import { ColorInputConfig } from "./ColorInputConfig";

export const GreenColorInputConfig: ColorInputConfig = {
  name: 'g',
  min: 0,
  max: 0xFF,
  base: 0x10,
  gradient: [{ r: 0, g: 0, b: 0 }, { r: 0, g: 0xFF, b: 0 }],
};
