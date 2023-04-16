import React, { ReactNode } from 'react';
import { ParamDefinitionSelection, ParamDefinition } from '../../generator/SvgGenerator';
import { StageItemState } from '../../config/Stage';
import { RangeInput } from '../../../ui/input/RangeInput';
import { EditorInput } from './EditorInput';

export class SelectionEditor extends EditorInput<string> {
  getEditorInput(
    name: string,
    definition: ParamDefinition,
    state: StageItemState<string>,
    action: (value: string) => void,
  ): ReactNode {
    const options = (definition as ParamDefinitionSelection)?.options;
    return (
      <RangeInput<string>
        label={name}
        value={options.indexOf(state.textValue)}
        output={state.textValue}
        onChange={action}
        min={0}
        max={options ? options.length - 1 : 0}
        step={1}
        options={options}
      />
    );
  }
}
