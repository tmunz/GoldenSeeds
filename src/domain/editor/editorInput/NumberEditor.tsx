import React, { ReactNode } from 'react';
import { ParamDefinitionMinMaxStep, ParamDefinition } from '../../generator/SvgGenerator';
import { NumberState } from '../../config/stageItemState/NumberState';
import { RangeInput } from '../../../ui/input/RangeInput';
import { EditorInput } from './EditorInput';

export class NumberEditor extends EditorInput<number, number> {
  getEditorInput(
    name: string,
    definition: ParamDefinition,
    state: NumberState,
    action: (value: number) => void,
  ): ReactNode {
    const value = state.isValid() ? state.getValue() : 0;
    return (
      <RangeInput<number>
        label={name}
        value={value ?? 0}
        onChange={action}
        className={state.isValid() ? '' : 'invalid range-invalid'}
        output={`${state.getTextValue()}`}
        min={(definition as ParamDefinitionMinMaxStep)?.min}
        max={(definition as ParamDefinitionMinMaxStep)?.max}
        step={(definition as ParamDefinitionMinMaxStep)?.step}
      />
    );
  }
}
