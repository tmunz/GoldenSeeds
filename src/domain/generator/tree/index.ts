import { MathUtils } from '../../../utils/MathUtils';
import { TreeConfig, draw } from './TreeDrawer';
import { SvgGenerator, SvgGeneratorResult } from '../SvgGenerator';
import { PointUtils } from '../../../utils/PointUtils';
import { Point } from '../../../datatypes/Point';

export class Tree extends SvgGenerator<TreeConfig> {
  static type = 'tree';

  static definition = {
    style: {
      color: { initial: 'gold', type: 'color' as const },
    },
    tree: {
      depth: {
        initial: '8',
        type: 'number' as const,
        min: 0,
        max: MathUtils.fib(7),
        step: 1,
        animateable: true,
      },
      seed: {
        initial: '999',
        type: 'number' as const,
        min: 0,
        max: 999,
        step: 1,
        animateable: true,
      },
    },
    split: {
      angle: {
        initial: '25',
        type: 'number' as const,
        min: 0,
        max: 90,
        step: 1,
      },
      variation: {
        initial: '0.0',
        type: 'number' as const,
        min: -1,
        max: 1,
        step: 0.05,
      },
      probability: {
        initial: '0.95',
        type: 'number' as const,
        min: 0,
        max: 1,
        step: 0.01,
      },
    },
    length: {
      conservation: {
        initial: '0.8',
        type: 'number' as const,
        min: 0,
        max: 1,
        step: 0.05,
      },
      variation: {
        initial: '1',
        type: 'number' as const,
        min: 0,
        max: 1,
        step: 0.05,
      },
    },
  };

  constructor() {
    super(Tree.type, Tree.definition);
  }

  generate(config: TreeConfig, prev: SvgGeneratorResult) {
    const drawing = draw(config, prev.grid);

    let drawingBoundingBox = PointUtils.boundingBox(drawing.points);

    // stabilize center if all prev points are x-axis-centered
    if (prev.grid.reduce((b: boolean, p: number[]) => b && p[Point.X] === 0, true)) {
      const extremeX = Math.max(-drawingBoundingBox.min[Point.X], drawingBoundingBox.max[Point.X]);
      drawingBoundingBox = {
        min: [-extremeX, drawingBoundingBox.min[Point.Y]],
        max: [extremeX, drawingBoundingBox.max[Point.Y]],
      };
    }

    return {
      grid: drawing.points,
      svg: drawing.svg,
      boundingBox: PointUtils.combineBoundingBoxes([prev.boundingBox, drawingBoundingBox]),
    };
  }
}
