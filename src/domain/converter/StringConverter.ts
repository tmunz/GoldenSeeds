import { Converter } from './Converter';

export class StringConverter extends Converter<string> {
  protected textToValue = (textValue: string): string => {
    return textValue;
  };
}
