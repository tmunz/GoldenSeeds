import { ParamDefinitionSelection, ParamDefinition } from '../generator/SvgGenerator';
import { StageItemState } from '../stage/Stage';
import { InputType } from '../../ui/input/Input';
import { SvgGeneratorInput, SvgGeneratorInputProps } from './SvgGeneratorInput';

export class SelectionInput<T> extends SvgGeneratorInput<T[]> {
  inputConfig(definition: ParamDefinition, state: StageItemState<T[]>): Partial<SvgGeneratorInputProps> & { inputType: InputType; } {
    const options = (definition as ParamDefinitionSelection)?.options;
    return {
      inputType: InputType.RANGE,
      min: 0,
      max: options ? options.length - 1 : 0,
      step: 1,
      value: options.indexOf(state.textValue),
      options,
    };
  }
}
