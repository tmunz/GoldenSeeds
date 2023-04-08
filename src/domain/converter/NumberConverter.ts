import { Converter } from './Converter';

export class NumberConverter extends Converter<number> {
  protected textToValue = (textValue: string): number => {
    const value = Number.parseFloat(textValue);
    return isFinite(value) ? value : 0;
  };
}
