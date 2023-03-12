import { MathUtils } from '../../../utils/MathUtils';
import { TreeConfig, draw } from './TreeDrawer';
import { SvgGenerator, SvgGeneratorResult } from '../SvgGenerator';
import { PointUtils } from '../../../utils/PointUtils';
import { Point } from '../../../datatypes/Point';

export class Tree implements SvgGenerator {
  static type = 'tree';
  type = Tree.type;

  definition = {
    color: { initial: 'gold', type: 'color' as const },
    depth: {
      initial: '8',
      type: 'number' as const,
      min: 0,
      max: MathUtils.fib(7),
      step: 1,
      animateable: true,
    },
    splitAngle: {
      initial: '25',
      type: 'number' as const,
      min: 0,
      max: 90,
      step: 1,
    },
    splitVariation: {
      initial: '0.0',
      type: 'number' as const,
      min: -1,
      max: 1,
      step: 0.05,
    },
    splitProbability: {
      initial: '0.9',
      type: 'number' as const,
      min: 0,
      max: 1,
      step: 0.05,
    },
    lengthConservation: {
      initial: '0.8',
      type: 'number' as const,
      min: 0,
      max: 1,
      step: 0.05,
    },
    lengthVariation: {
      initial: '1',
      type: 'number' as const,
      min: 0,
      max: 1,
      step: 0.05,
    },
    seed: {
      initial: '0',
      type: 'number' as const,
      min: 0,
      max: 1000,
      step: 1,
      animateable: true,
    },
  };

  generate = (config: TreeConfig, prev: SvgGeneratorResult) => {
    const drawing = draw(config, prev.grid);

    let drawingBoundingBox = PointUtils.boundingBox(drawing.points);

    // stabilize center if all prev points are x-axis-centered
    if ( prev.grid.reduce( (b: boolean, p: number[]) => b && p[Point.X] === 0, true)) {
      const extremeX = Math.max(-drawingBoundingBox.min[Point.X], drawingBoundingBox.max[Point.X]);
      drawingBoundingBox = {
        min: [-extremeX, drawingBoundingBox.min[Point.Y]],
        max: [extremeX, drawingBoundingBox.max[Point.Y]]
      };
    }

    return {
      grid: drawing.points,
      svg: drawing.svg,
      boundingBox: PointUtils.combineBoundingBoxes([prev.boundingBox, drawingBoundingBox]),
    };
  };
}
