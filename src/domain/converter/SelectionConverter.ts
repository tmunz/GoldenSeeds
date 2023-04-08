import { StringConverter } from './StringConverter';

export class SelectionConverter extends StringConverter {
  protected textToValue = (textValue: string): string => {
    return textValue;
  };
}
