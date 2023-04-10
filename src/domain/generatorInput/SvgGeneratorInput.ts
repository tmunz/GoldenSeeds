import { ParamDefinition } from '../generator/SvgGenerator';
import { StageItemState } from '../stage/Stage';
import { InputType } from '../../ui/input/Input';
import { Props as EditorInputProps } from '../editor/EditorInput';

export type SvgGeneratorInputProps = EditorInputProps;

export abstract class SvgGeneratorInput<T> {
  protected abstract inputConfig(
    definition: ParamDefinition,
    state: StageItemState<T>,
  ): Partial<EditorInputProps> & { inputType: InputType };

  getInputFieldConfiguration(name: string, definition: ParamDefinition, state: StageItemState<T>): EditorInputProps {
    return {
      label: name,
      value: state.textValue,
      valid: state.valid,
      output: state.textValue,
      ...this.inputConfig(definition, state),
    };
  }
}
