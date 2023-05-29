import React, { ReactNode } from 'react';
import { ParamDefinition } from '../../generator/SvgGenerator';
import { StageItemState } from '../../config/Stage';
import { Color } from '../../../datatypes/Color';
import { EditorInput } from './EditorInput';
import { ColorSelector } from '../../../ui/input/ColorSelector';

export class ColorEditor extends EditorInput<Color> {
  getEditorInput(
    name: string,
    definition: ParamDefinition,
    state: StageItemState<Color>,
    action: (textValue: string) => void,
  ): ReactNode {
    return <ColorSelector label={name} value={state.textValue} onChange={action} />;
  }
}
