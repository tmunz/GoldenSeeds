import { InputType } from '../ui/input/Input';
import { Converter } from './Converter';

export class NumberConverter extends Converter<number> {

  inputConfig = () => {
    return { 
      inputType: InputType.RANGE, 
    };
  }

  protected convertFromRaw = (rawValue: string): number => {
    const value = Number.parseFloat(rawValue);
    return isFinite(value) ? value : null;
  }
}
