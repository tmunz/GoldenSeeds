import {
  ParamDefinitionSelection,
  ParamDefinition,
} from '../generator/SvgGenerator';
import { StageState } from '../stage/Stage';
import { InputType } from '../../ui/input/Input';
import { SvgGeneratorInput } from './SvgGeneratorInput';

export class SelectionInput<T> extends SvgGeneratorInput<T[]> {
  inputConfig(
    stageId: number,
    name: string,
    definition: ParamDefinition,
    state: StageState<T[]>,
  ) {
    const options = (definition as ParamDefinitionSelection)?.options;
    return {
      inputType: InputType.RANGE,
      min: 0,
      max: options ? options.length - 1 : 0,
      step: 1,
      rangeValue: options?.findIndex((s) => s.toString() === state.rawValue),
      convertToString: (i: any) => (options ? options[i].toString() : ''),
    };
  }
}
