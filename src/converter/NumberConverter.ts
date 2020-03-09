import { InputType } from '../ui/input/Input';
import { Converter } from './Converter';
import { StageState } from '../stage/Stage';

export class NumberConverter extends Converter<number> {

  inputConfig = (stage: string, configItem: StageState<number>) => {
    return { inputType: InputType.RANGE, canExpertMode: false };
  }

  protected convertFromRaw = (rawValue: string): number => {
    const value = Number.parseInt(rawValue);
    return isFinite(value) ? value : null;
  }
}
