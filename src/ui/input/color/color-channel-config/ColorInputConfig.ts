import { RgbaColor, HslaColor } from '../../../../datatypes/Color';

export interface ColorInputConfig {
  name: string;
  unit?: string;
  min?: number;
  max?: number;
  base?: number;
  gradient: Partial<RgbaColor | HslaColor>[]
}
