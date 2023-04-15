import { Converter } from './Converter';

export class FontConverter extends Converter<ArrayBuffer> {
  protected async asyncTextToValue(textValue: string): Promise<ArrayBuffer> {
    const font = await (await fetch(textValue)).arrayBuffer();
    return font;
  }
}
