import React, { ReactNode } from 'react';
import { ParamDefinition } from '../../generator/SvgGenerator';
import { StageItemState } from '../../stage/Stage';
import { Color } from '../../../datatypes/Color';
import { ColorInput } from '../../../ui/input/ColorInput';
import { EditorInput } from './EditorInput';

export class ColorEditor extends EditorInput<Color> {
  getEditorInput(
    name: string,
    definition: ParamDefinition,
    state: StageItemState<Color>,
    action: (value: string) => void,
  ): ReactNode {
    return <ColorInput
      label={name}
      value={state.value}
      onChange={action}
    />;
  }
}
