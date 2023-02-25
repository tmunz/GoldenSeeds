import { Converter } from './Converter';

export class NumberConverter extends Converter<number> {
  protected convertFromRaw = (rawValue: string): number => {
    const value = Number.parseFloat(rawValue);
    return isFinite(value) ? value : null;
  };
}
