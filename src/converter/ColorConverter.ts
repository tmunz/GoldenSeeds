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
      canExpertMode: true,
      rangeValue: configItem.value.get(),
      min: -1,
      max: 0x1000000,
      step: 1,
    };
  }
}
