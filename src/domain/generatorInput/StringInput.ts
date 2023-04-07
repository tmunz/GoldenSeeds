import { ParamDefinition } from '../generator/SvgGenerator';
import { StageItemState } from '../stage/Stage';
import { InputType } from '../../ui/input/Input';
import { SvgGeneratorInput } from './SvgGeneratorInput';

export class StringInput extends SvgGeneratorInput<string> {
  inputConfig(definition: ParamDefinition, state: StageItemState<string>) {
    return {
      inputType: InputType.TEXT,
    };
  }
}
