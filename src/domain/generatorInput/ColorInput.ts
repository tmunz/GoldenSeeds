import { ParamDefinition } from '../generator/SvgGenerator';
import { StageItemState } from '../stage/Stage';
import { InputType } from '../../ui/input/Input';
import { Color } from '../../datatypes/Color';
import { SvgGeneratorInput } from './SvgGeneratorInput';

export class ColorInput extends SvgGeneratorInput<Color> {
  inputConfig(definition: ParamDefinition, state: StageItemState<Color>) {
    return {
      inputType: InputType.COLOR,
      value: state.value,
    };
  }
}
