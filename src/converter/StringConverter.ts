import { InputType } from '../ui/input/Input';
import { Converter } from './Converter';
import { StageState } from '../stage/Stage';

export class StringConverter extends Converter<string> {

  inputConfig = (stage: number, configItem: StageState<string>) => {
    return { inputType: InputType.TEXT, canExpertMode: false };
  }

  protected convertFromRaw = (rawValue: string): string => {
    return rawValue;
  }
}
