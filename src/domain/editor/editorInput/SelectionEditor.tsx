import React, { ReactNode } from 'react';
import { ParamDefinitionSelection, ParamDefinition } from '../../generator/SvgGenerator';
import { StringState } from '../../config/stageItemState/StringState';
import { RangeInput } from '../../../ui/input/RangeInput';
import { EditorInput } from './EditorInput';

export class SelectionEditor extends EditorInput<string, string> {
  getEditorInput(
    name: string,
    definition: ParamDefinition,
    state: StringState,
    action: (textValue: string) => void,
  ): ReactNode {
    const options = (definition as ParamDefinitionSelection)?.options;
    return (
      <RangeInput<string>
        label={name}
        value={options.indexOf(state.getValue() ?? '') ?? ''}
        output={state.getTextValue() ?? ''}
        onChange={action}
        min={0}
        max={options ? options.length - 1 : 0}
        step={1}
        options={options}
      />
    );
  }
}
