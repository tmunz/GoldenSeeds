import { StageState } from '../stage/Stage';

export abstract class Converter<T> {
  protected abstract convertFromRaw(rawValue: string): T;

  convert = (rawValue: string): Partial<StageState<T>> => {
    const value = this.convertFromRaw(rawValue);
    const valid = typeof value !== 'undefined' && value !== null;
    const converted: Partial<StageState<T>> = { rawValue, valid };
    if (valid) {
      converted.value = value;
    }
    return converted;
  };
}
