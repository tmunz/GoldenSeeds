import { Converter } from './Converter';
import { Font } from 'opentype.js';
import { fontService } from '../font/FontService';

export class FontConverter extends Converter<Font> {
  protected async asyncTextToValue(textValue: string): Promise<Font> {
    return fontService.get(textValue);
  }
}
