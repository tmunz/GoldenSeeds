import React, { ReactNode } from 'react';
import { ParamDefinitionMinMaxStep, ParamDefinition } from '../../generator/SvgGenerator';
import { StageItemState } from '../../stage/Stage';
import { RangeInput } from '../../../ui/input/RangeInput';
import { EditorInput } from './EditorInput';

export class NumberEditor extends EditorInput<number> {
  getEditorInput(
    name: string,
    definition: ParamDefinition,
    state: StageItemState<number>,
    action: (value: string) => void,
  ): ReactNode {
    return <RangeInput
      label={name}
      value={Number.parseFloat(state.textValue)}
      onChange={value => action(`${value}`)}
      className={state.valid ? '' : 'invalid range-invalid'}
      output={state.textValue}
      min={(definition as ParamDefinitionMinMaxStep)?.min}
      max={(definition as ParamDefinitionMinMaxStep)?.max}
      step={(definition as ParamDefinitionMinMaxStep)?.step}
    />;
  }
}
