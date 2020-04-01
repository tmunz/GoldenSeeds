import { Stage, StageResult } from '../../Stage';

export class CartesianGrid extends Stage {

  static type = 'cartesian';
  type = CartesianGrid.type;

  definition = {
    x: { initial: '5', type: { name: 'number' as const, min: 1, max: 25, step: 1 } },
    items: { initial: '20', type: { name: 'number' as const, min: 1, max: 625, step: 1 } },
  };

  generate = ({ x, items }: { x: number; items: number }, prev: StageResult): StageResult => {
    // TODO use prev
    const grid = [];
    for (let i = 0; i < items; i++) {
      grid.push([i % x, Math.floor(i / x)]);
    }
    return { grid, boundingBox: { x: 0, y: 0, w: x - 1, h: Math.ceil(items / x) - 1 }, render: null };
  }
}
