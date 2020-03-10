import { Props as DrawConfigInputProps } from '../editor/DrawConfigInput';
import { InputType } from '../ui/input/Input';
import { StageState } from '../Config';

export abstract class Converter<T> {

  name: string;
  protected _range: { min: number; max: number; step: number };

  constructor(name: string, range?: { min: number; max: number; step: number }) {
    this.name = name;
    this._range = range;
  }

  protected abstract convertFromRaw(rawValue: string): T;

  protected abstract inputConfig(stage: string, configItem: StageState<T>):
    Partial<DrawConfigInputProps> & { inputType: InputType; };

  getInputFieldConfiguration = (stage: string, configItem: StageState<T>): DrawConfigInputProps => {
    return {
      label: this.name,
      textValue: configItem.value.toString(),
      rangeValue: Number(configItem.value),
      valid: configItem.valid,
      ...(this._range ? this._range : {}),
      ...this.inputConfig(stage, configItem),
    };
  }

  convert = (rawValue: string): Partial<StageState<T>> => {
    const value = this.convertFromRaw(rawValue);
    const valid = typeof value !== 'undefined' && value !== null;
    const converted: Partial<StageState<T>> = { rawValue, valid };
    if (valid) {
      converted.value = value;
    }
    return converted;
  }
}
