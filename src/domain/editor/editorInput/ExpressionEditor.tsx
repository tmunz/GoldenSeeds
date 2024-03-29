import React, { ReactNode } from 'react';
import { ParamDefinition, ParamDefinitionMinMaxStep } from '../../generator/SvgGenerator';
import { EditorInput } from './EditorInput';
import { ExtendedRangeInput } from '../../../ui/input/ExtendedRangeInput';
import { Expression, ExpressionState } from '../../config/stageItemState/ExpressionState';

export class ExpressionEditor extends EditorInput<Expression, string> {
  getEditorInput(
    name: string,
    definition: ParamDefinition,
    state: ExpressionState,
    action: (value: string) => void,
  ): ReactNode {
    // const regexResult = state.textValue.match(/^\s*(n\s\*\s*(.*\S)?)\s*$/);
    // const nMode: boolean = regexResult ? true : false;
    // const controls = [this.generateNControl(stage, nLessValue, nMode)];

    return (
      <ExtendedRangeInput
        label={name}
        value={state.getTextValue() ?? ''}
        onChange={action}
        className={state.isValid() ? '' : 'invalid range-invalid'}
        min={(definition as ParamDefinitionMinMaxStep)?.min}
        max={(definition as ParamDefinitionMinMaxStep)?.max}
        step={(definition as ParamDefinitionMinMaxStep)?.step}
      />
    );
  }

  // controls,
  // convertToString: (i: any) => `${nMode && typeof i === 'number' ? 'n * ' : ''}${i}`,

  /*private generateNControl(stage: number, nLessValue: string, active: boolean): JSX.Element {
    return <div
      key={this.name}
      className={['n-mode-selector', active ? 'active' : ''].join(' ')}
      onClick={() => { stageService.setConfigValue(stage, this.name, (active ? '' : 'n * ') + nLessValue); }}
    >
      n
    </div >;
  }*/
}
