import { ColorInputConfig } from './ColorInputConfig';

export const RedColorInputConfig: ColorInputConfig = {
  name: 'r',
  min: 0,
  max: 0xFF,
  base: 0x10,
  gradient: [{ r: 0 }, { r: 0xFF }],
};
