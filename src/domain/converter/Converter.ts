import { StageItemState } from '../config/Stage';

export abstract class Converter<T> {
  protected textToValue(textValue: string): T {
    return textValue as unknown as T;
  }

  protected async asyncTextToValue(textValue: string): Promise<T> {
    return Promise.resolve(this.textToValue(textValue));
  }

  convert = async (textValue: string): Promise<Partial<StageItemState<T>>> => {
    const value = await this.asyncTextToValue(textValue);
    const valid = typeof value !== 'undefined' && value !== null;
    const converted: Partial<StageItemState<T>> = { textValue, valid };
    if (valid) {
      converted.value = value;
    }
    return converted;
  };
}
