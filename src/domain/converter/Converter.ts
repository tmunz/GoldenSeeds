import { StageItemState } from '../stage/Stage';

export abstract class Converter<T> {
  protected abstract convertFromRaw(rawValue: string): T;

  convert = (rawValue: string): Partial<StageItemState<T>> => {
    const value = this.convertFromRaw(rawValue);
    const valid = typeof value !== 'undefined' && value !== null;
    const converted: Partial<StageItemState<T>> = { rawValue, valid };
    if (valid) {
      converted.value = value;
    }
    return converted;
  };
}
