import { ParamDefinition } from '../generator/SvgGenerator';
import { StageState } from '../stage/Stage';
import { InputType } from '../../ui/input/Input';
import { SvgGeneratorInput } from './SvgGeneratorInput';

export class StringInput extends SvgGeneratorInput<string> {

  inputConfig(stageId: number, name: string, definition: ParamDefinition, state: StageState<string>) {
    return {
      inputType: InputType.TEXT,
    };
  }
}
