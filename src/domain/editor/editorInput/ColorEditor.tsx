import React, { ReactNode } from 'react';
import { ParamDefinition } from '../../generator/SvgGenerator';
import { Color } from '../../../datatypes/Color';
import { EditorInput } from './EditorInput';
import { ColorInput } from '../../../ui/input/color/ColorInput';
import { ColorState } from '../../config/stageItemState/ColorState';

export class ColorEditor extends EditorInput<Color, Color> {
  getEditorInput(
    name: string,
    definition: ParamDefinition,
    state: ColorState,
    action: (value: Color) => void,
  ): ReactNode {
    return <ColorInput label={name} value={state.getValue()} onChange={action} />;
  }
}
