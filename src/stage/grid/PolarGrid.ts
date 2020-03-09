import { Grid } from './Grid';
import { NumberConverter, ExpressionConverter } from '../../converter';
import { MathUtils } from '../../utils/MathUtils';

export class PolarGrid extends Grid {

  type = 'polar';

  initialState = {
    items: '987',
    angle: 'n * 360 / goldenRatio',
    distance: 'Math.pow(n, 1 / goldenRatio)'
  };

  converter = {
    items: new NumberConverter('items', { min: 1, max: MathUtils.fib(16), step: 1 }),
    distance: new ExpressionConverter('distance', { min: 0, max: 100, step: 0.01 }),
    angle: new ExpressionConverter('angle', { min: 0, max: 360, step: 1 }),
  };

  generate = ({ items, angle, distance }: {
    items: number;
    angle: (n: number, items: number) => number;
    distance: (n: number, items: number) => number;
  }) => {
    const result = [];
    for (let n = 1; n <= items; n++) {
      const rad = angle(n, items) / 180 * Math.PI;
      result.push([Math.cos(rad), Math.sin(rad)].map((trig, i) => distance(n, items) * trig));
    }
    const radius = distance(items, items);
    return { result, boundingBox: { x: -radius, y: -radius, w: radius * 2, h: radius * 2 } };
  }
}
