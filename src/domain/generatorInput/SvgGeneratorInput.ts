import { ParamDefinition } from '../generator/SvgGenerator';
import { StageState } from '../stage/Stage';
import { InputType } from '../../ui/input/Input';
import { Props as EditorInputProps } from '../editor/EditorInput';

export abstract class SvgGeneratorInput<T> {
  protected abstract inputConfig(
    stageId: string,
    name: string,
    definition: ParamDefinition,
    state: StageState<T>,
  ): Partial<EditorInputProps> & { inputType: InputType };

  getInputFieldConfiguration(
    stageId: string,
    name: string,
    definition: ParamDefinition,
    state: StageState<T>,
  ): EditorInputProps {
    return {
      label: name,
      textValue: state.value.toString(),
      rangeValue: Number(state.value),
      valid: state.valid,
      ...this.inputConfig(stageId, name, definition, state),
    };
  }
}
