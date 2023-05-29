import { ColorInputConfig } from "./ColorInputConfig";

export const BlueColorInputConfig: ColorInputConfig = {
  name: 'b',
  min: 0,
  max: 0xFF,
  base: 0x10,
  gradient: [{ b: 0 }, { b: 0xFF }],
};
