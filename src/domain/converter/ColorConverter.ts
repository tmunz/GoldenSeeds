import { Color } from '../../datatypes/Color';
import { Converter } from './Converter';

export class ColorConverter extends Converter<Color> {
  protected textToValue(textValue: string): Color {
    return new Color(textValue);
  }
}
