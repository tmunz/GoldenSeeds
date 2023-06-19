import { MathUtils } from '../../../utils/MathUtils';
import { StageItemState } from './StageItemState';

export type Expression = (n: number, items: number, itemSize: (n: number) => number, i: number) => number;

export class ExpressionState implements StageItemState<Expression, string> {

  private text: string = '() => 1';
  private expression: Expression = (() => 1);
  private valid: boolean = true;

  getValue(): Expression {
    return this.expression;
  }

  setValue(text: string): void {
    this.text = text;
    try {
      const expression = ExpressionState.convertToExpression(text);
      // don't check everything because of performance reasons
      [0, 1].map((d: number) => expression(d, 2, (n: number) => n, 1)); //test Expression
      this.expression = expression;
      this.valid = true;
    } catch (e) {
      console.warn(e);
      this.valid = false;
    }
  }

  getTextValue(): string {
    return this.text;
  }

  async setTextValue(s: string): Promise<void> {
    this.setValue(s);
  }

  isValid(): boolean {
    return this.valid;
  }

  private static convertToExpression = (expressionText: string): Expression => {
    return eval(
      `(n, items, itemSize, i) => ((fib, goldenRatio) => 
      isFinite(Number(${expressionText})) ? Number(${expressionText}) : ${expressionText})
      (${(v: number) => MathUtils.fib(v)}, ${MathUtils.goldenRatio})`,
    );
  };
}
