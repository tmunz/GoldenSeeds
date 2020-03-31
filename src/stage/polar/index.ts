import { NumberConverter, ExpressionConverter } from '../../converter';
import { MathUtils } from '../../utils/MathUtils';
import { StageResult, Stage } from '../Stage';

export class PolarGrid extends Stage {

  type = 'polar';

  initialState = {
    items: '21',
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
  }, prev: StageResult): StageResult => {
    // TODO use prev
    const grid = [];
    for (let n = 1; n <= items; n++) {
      const rad = angle(n, items) / 180 * Math.PI;
      grid.push([Math.cos(rad), Math.sin(rad)].map((trig, i) => distance(n, items) * trig));
    }
    const radius = distance(items, items);
    return { grid, boundingBox: { x: -radius, y: -radius, w: radius * 2, h: radius * 2 }, render: null };
  }
}
