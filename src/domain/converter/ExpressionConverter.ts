import { MathUtils } from '../../utils/MathUtils';
import { Converter } from './Converter';

export class ExpressionConverter extends Converter<
  (n: number, items: number, itemSize: (n: number) => number) => number
> {
  protected convertFromRaw = (
    rawValue: string,
  ): ((
    n: number,
    items: number,
    itemSize: (n: number) => number,
  ) => number) => {
    try {
      const expression = this.convertToExpression(rawValue);
      // don't check everything because of performance reasons
      [0, 1].map((i: number) => expression(i, 100, (n) => n)); //test Expression
      return expression;
    } catch (e) {
      return this.convertToExpression('n'); // TODO use last valid one
    }
  };

  private convertToExpression = (
    expression: string,
  ): ((
    n: number,
    items: number,
    itemSize: (n: number) => number,
  ) => number) => {
    return eval(
      `(n, items, itemSize) => ((fib, goldenRatio) => ${expression})(${MathUtils.fib}, ${MathUtils.goldenRatio})`,
    );
  };
}
