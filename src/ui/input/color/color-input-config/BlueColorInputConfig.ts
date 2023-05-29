import { ColorInputConfig } from "./ColorInputConfig";

export const BlueColorInputConfig: ColorInputConfig = {
  name: 'b',
  min: 0,
  max: 0xFF,
  base: 0x10,
  gradient: [{ r: 0, g: 0, b: 0 }, { r: 0, g: 0, b: 0xFF }],
};
