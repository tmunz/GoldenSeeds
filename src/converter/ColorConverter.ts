import { InputType } from '../ui/input/Input';
import { Converter } from './Converter';
import { StageState } from '../Config';
import { Color } from '../datatypes/Color';

export class ColorConverter extends Converter<Color> {

  convertFromRaw(rawValue: string): Color {
    return Color.convertToColor(rawValue);
  }

  inputConfig = (stage: string, configItem: StageState<Color>) => {
    return { 
      inputType: InputType.COLOR, 
      rangeValue: configItem.value.get(),
    };
  }
}
