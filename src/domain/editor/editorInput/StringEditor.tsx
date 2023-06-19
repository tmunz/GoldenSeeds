import React, { ReactNode } from 'react';
import { EditorInput } from './EditorInput';
import { ParamDefinition } from '../../generator/SvgGenerator';
import { StringState } from '../../config/stageItemState/StringState';
import { TextInput } from '../../../ui/input/TextInput';

export class StringEditor extends EditorInput<string, string> {
  getEditorInput(
    name: string,
    definition: ParamDefinition,
    state: StringState,
    action: (textValue: string) => void,
  ): ReactNode {
    return <TextInput label={name} value={state.getValue() ?? ''} onChange={action} />;
  }
}
