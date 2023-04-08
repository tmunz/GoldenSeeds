import { ParamDefinitionMinMaxStep, ParamDefinition } from '../generator/SvgGenerator';
import { StageItemState } from '../stage/Stage';
import { InputType } from '../../ui/input/Input';
import { SvgGeneratorInput } from './SvgGeneratorInput';

export class NumberInput extends SvgGeneratorInput<number> {
  inputConfig(definition: ParamDefinition, state: StageItemState<number>) {
    return {
      value: Number.parseFloat(state.textValue),
      inputType: InputType.RANGE,
      min: (definition as ParamDefinitionMinMaxStep)?.min,
      max: (definition as ParamDefinitionMinMaxStep)?.max,
      step: (definition as ParamDefinitionMinMaxStep)?.step,
    };
  }
}
