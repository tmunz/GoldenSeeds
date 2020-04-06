import { ParamDefinition } from '../generator/SvgGenerator';
import { StageState } from '../stage/Stage';
import { InputType } from '../../ui/input/Input';
import { Color } from '../../datatypes/Color';
import { SvgGeneratorInput } from './SvgGeneratorInput';

export class ColorInput extends SvgGeneratorInput<Color> {

  inputConfig(stageId: number, name: string, definition: ParamDefinition, state: StageState<Color>) {
    return {
      inputType: InputType.COLOR,
    };
  }
}
