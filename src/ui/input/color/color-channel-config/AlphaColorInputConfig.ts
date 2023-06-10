import { ColorInputConfig } from './ColorInputConfig';

export const AlphaColorInputConfig: ColorInputConfig = {
  name: 'a',
  unit: '%',
  min: 0,
  max: 100,
  base: 10,
  gradient: [{ a: 0 }, { a: 1 }],
};
