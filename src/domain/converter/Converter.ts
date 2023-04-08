import { StageItemState } from '../stage/Stage';

export abstract class Converter<T> {
  protected abstract textToValue(textValue: string): T;

  convert = (textValue: string): Partial<StageItemState<T>> => {
    const value = this.textToValue(textValue);
    const valid = typeof value !== 'undefined' && value !== null;
    const converted: Partial<StageItemState<T>> = { textValue, valid };
    if (valid) {
      converted.value = value;
    }
    return converted;
  };
}
