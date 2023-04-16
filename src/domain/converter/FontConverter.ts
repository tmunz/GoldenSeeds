import { Converter } from './Converter';
import { Font } from 'opentype.js';
import { fontService } from '../font/FontService';

export class FontConverter extends Converter<Font> {
  protected async asyncTextToValue(textValue: string): Promise<Font> {
    return await fontService.get(textValue);
  }
}
