import { ParamDefinitionMinMaxStep, ParamDefinition } from '../generator/SvgGenerator';
import { StageState } from '../stage/Stage';
import { InputType } from '../../ui/input/Input';
import { SvgGeneratorInput } from './SvgGeneratorInput';

export class NumberInput extends SvgGeneratorInput<number> {

  inputConfig(stageId: number, name: string, definition: ParamDefinition, state: StageState<number>) {
    return {
      inputType: InputType.RANGE,
      min: (definition as ParamDefinitionMinMaxStep)?.min,
      max: (definition as ParamDefinitionMinMaxStep)?.max,
      step: (definition as ParamDefinitionMinMaxStep)?.step,
    };
  }
}
