import { MathUtils } from '../../utils/MathUtils';
import { Converter } from './Converter';

export class ExpressionConverter extends Converter<
  (n: number, items: number, itemSize: (n: number) => number, i: number) => number
> {
  protected textToValue = (
    textValue: string,
  ): ((n: number, items: number, itemSize: (n: number) => number, i?: number) => number) => {
    try {
      const expression = this.convertToExpression(textValue);
      // don't check everything because of performance reasons
      [0, 1].map((d: number) => expression(d, 2, (n) => n)); //test Expression
      return expression;
    } catch (e) {
      console.warn(e);
      return this.convertToExpression('1'); // TODO use last valid one
    }
  };

  private convertToExpression = (
    expression: string,
  ): ((n: number, items: number, itemSize: (n: number) => number) => number) => {
    return eval(
      `(n, items, itemSize, i) => ((fib, goldenRatio) => ${expression})(${(v: number) => MathUtils.fib(v)}, ${
        MathUtils.goldenRatio
      })`,
    );
  };
}
