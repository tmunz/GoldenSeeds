import React, { ReactNode } from 'react';
import { EditorInput } from './EditorInput';
import { ParamDefinition } from '../../generator/SvgGenerator';
import { StageItemState } from '../../stage/Stage';
import { TextInput } from '../../../ui/input/TextInput';

export class StringEditor extends EditorInput<string> {
  getEditorInput(
    name: string,
    definition: ParamDefinition,
    state: StageItemState<string>,
    action: (value: string) => void,
  ): ReactNode {
    return <TextInput label={name} value={state.textValue} onChange={action} />;
  }
}
