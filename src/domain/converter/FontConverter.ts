import { parse, Font } from 'opentype.js';

import { Converter } from './Converter';

export class FontConverter extends Converter<Font> {
  protected async asyncTextToValue(textValue: string): Promise<Font> {
    const font = parse(await (await fetch(textValue)).arrayBuffer());
    console.log('loaded and supported', font.supported);
    return font;
  }
}
