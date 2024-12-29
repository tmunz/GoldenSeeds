import React, { ReactNode } from 'react';
import { ParamDefinitionMinMaxStep, ParamDefinition } from '../../generator/SvgGenerator';
import { NumberState } from '../../config/stageItemState/NumberState';
import { EditorInput } from './EditorInput';
import { ExtendedRangeInput } from '../../../ui/input/ExtendedRangeInput';

export class NumberEditor extends EditorInput<number, number> {
  getEditorInput(
    name: string,
    definition: ParamDefinition,
    state: NumberState,
    action: (value: number) => void,
  ): ReactNode {
    return <ExtendedRangeInput
      label={name}
      value={state.getTextValue() ?? ''}
      onChange={s => action(Number(s))}
      className={state.isValid() ? '' : 'invalid range-invalid'}
      min={(definition as ParamDefinitionMinMaxStep)?.min}
      max={(definition as ParamDefinitionMinMaxStep)?.max}
      step={(definition as ParamDefinitionMinMaxStep)?.step}
    />;
  }
}
