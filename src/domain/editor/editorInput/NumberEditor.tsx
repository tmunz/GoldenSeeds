import React, { ReactNode } from 'react';
import { ParamDefinitionMinMaxStep, ParamDefinition } from '../../generator/SvgGenerator';
import { StageItemState } from '../../config/Stage';
import { RangeInput } from '../../../ui/input/RangeInput';
import { EditorInput } from './EditorInput';

export class NumberEditor extends EditorInput<number> {
  getEditorInput(
    name: string,
    definition: ParamDefinition,
    state: StageItemState<number>,
    action: (value: string) => void,
  ): ReactNode {
    const value = Number.parseFloat(state.textValue);
    return (
      <RangeInput<number>
        label={name}
        value={isFinite(value) ? value : 0}
        onChange={(value) => action(`${value}`)}
        className={state.valid ? '' : 'invalid range-invalid'}
        output={state.textValue}
        min={(definition as ParamDefinitionMinMaxStep)?.min}
        max={(definition as ParamDefinitionMinMaxStep)?.max}
        step={(definition as ParamDefinitionMinMaxStep)?.step}
      />
    );
  }
}
