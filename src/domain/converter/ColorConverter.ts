import { Color } from '../../datatypes/Color';
import { Converter } from './Converter';

export class ColorConverter extends Converter<Color> {
  convertFromRaw(rawValue: string): Color {
    return Color.convertToColor(rawValue);
  }
}
