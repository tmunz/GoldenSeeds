import { Props as DrawConfigInputProps } from "../editor/DrawConfigInput";
import { InputType } from "../ui/input/Input";
import { StageState } from "../Config";

export abstract class Converter<T> {

  name: string;
  protected _range: { min: number, max: number, step: number };

  constructor(name: string, range?: { min: number, max: number, step: number }) {
    this.name = name;
    this._range = range;
  }

  protected abstract convertFromRaw(rawValue: string): T;

  // TODO typing: and other DrawConfigInputProps 
  protected abstract inputConfig(stage: string, configItem: StageState<T>): { inputType: InputType, canExpertMode: boolean };

  getInputFieldConfiguration = (stage: string, configItem: StageState<T>): DrawConfigInputProps => {
    return {
      label: this.name,
      textValue: configItem.value.toString(),
      rangeValue: Number(configItem.value),
      valid: configItem.valid,
      ...(this._range ? this._range : {}),
      ...this.inputConfig(stage, configItem),
    }
  }

  convert = (rawValue: string): StageState<any> => {
    const value = this.convertFromRaw(rawValue);
    const valid = typeof value !== "undefined" && value !== null;
    const converted: StageState<T> = { rawValue, valid } as StageState<T>;
    if (valid) {
      converted.value = value;
    }
    return converted;
  }
}
