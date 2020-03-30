import React from 'react';

import { MathUtils } from '../utils/MathUtils';
import { InputType } from '../ui/input/Input';
import { StageState } from '../Config';
import { Converter } from './Converter';
import { stageService } from '../stage/StageService';


export class ExpressionConverter extends Converter<(n: number, items: number, itemSize: (n: number) => number) => number> {

  inputConfig = (stage: number, configItem: StageState<(n: number, items: number, itemSize: (n: number) => number) => number>) => {
    const regexResult = configItem.rawValue.match(/^\s*(n\s\*\s*(.*\S)?)\s*$/);
    const nMode: boolean = regexResult ? true : false;
    const nLessValue: string = nMode ? regexResult[2] : configItem.rawValue;
    const rangeValue: number = parseFloat(nLessValue);
    const controls = [this.generateNControl(stage, nLessValue, nMode)];

    return {
      textValue: configItem.rawValue,
      inputType: InputType.EXTENDED_RANGE,
      canExpertMode: true,
      rangeValue,
      controls,
      convertToString: (i: any) => `${nMode && typeof i === 'number' ? 'n * ' : ''}${i}`,
    };
  }

  private generateNControl(stage: number, nLessValue: string, active: boolean): JSX.Element {
    return <div
      key={this.name}
      className={['n-mode-selector', active ? 'active' : ''].join(' ')}
      onClick={() => { stageService.setConfigValue(stage, this.name, (active ? '' : 'n * ') + nLessValue); }}
    >
      n
    </div >;
  }

  protected convertFromRaw = (rawValue: string): ((n: number, items: number, itemSize: (n: number) => number) => number) => {
    try {
      const expression = this.convertToExpression(rawValue);
      // don't check everything because of performance reasons
      [0, 1].map((i: number) => expression(i, 100, n => n)); //test Expression 
      return expression;
    } catch (e) {
      return null;
    }
  }

  private convertToExpression = (expression: string): ((n: number, items: number, itemSize: (n: number) => number) => number) => {
    return eval(
      `(n, items, itemSize) => ((fib, goldenRatio) => ${expression})(${MathUtils.fib}, ${MathUtils.goldenRatio})`
    );
  }
}
