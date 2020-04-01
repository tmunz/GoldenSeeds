import { Converter } from './Converter';

export class StringConverter extends Converter<string> {

  protected convertFromRaw = (rawValue: string): string => {
    return rawValue;
  }
}
