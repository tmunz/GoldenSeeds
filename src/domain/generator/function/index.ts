import { MathUtils } from '../../../utils/MathUtils';
import { SvgGenerator, SvgGeneratorResult } from '../SvgGenerator';
import { PointUtils } from '../../../utils/PointUtils';
import { Point } from '../../../datatypes/Point';
import { draw, FunctionConfig } from './FunctionDrawer';

export class FunctionGrid implements SvgGenerator {
  static type = 'function';
  type = FunctionGrid.type;

  definition = {
    color: { initial: 'gold', type: 'color' as const },
    strokeWidth: {
      initial: '1',
      type: 'expression' as const,
      min: 0,
      max: 10,
      step: 0.05,
    },
    items: {
      initial: '1',
      type: 'number' as const,
      min: 1,
      max: MathUtils.fib(16),
      step: 1,
      animateable: true,
    },
    functionX: {
      initial: '0',
      type: 'expression' as const,
      min: -10,
      max: 10,
      step: 0.1,
    },
    functionY: {
      initial: '0',
      type: 'expression' as const,
      min: -10,
      max: 10,
      step: 0.1,
    }
  };

  generate = (config: FunctionConfig, prev: SvgGeneratorResult): SvgGeneratorResult => {
    const drawing = draw(config, prev.grid);

    let drawingBoundingBox = PointUtils.boundingBox(drawing.points);

    // stabilize center if all prev points are centered
    if (prev.grid.reduce((b: boolean, p: number[]) => b && p[Point.X] === 0 && p[Point.Y] === 0, true)) {
      const extremeX = Math.max(-drawingBoundingBox.min[Point.X], drawingBoundingBox.max[Point.X]);
      const extremeY = Math.max(-drawingBoundingBox.min[Point.Y], drawingBoundingBox.max[Point.Y]);
      drawingBoundingBox = {
        min: [-extremeX, -extremeY],
        max: [extremeX, extremeY],
      };
    }

    return {
      grid: drawing.points,
      svg: drawing.svg,
      boundingBox: PointUtils.combineBoundingBoxes([prev.boundingBox, drawingBoundingBox]),
    };
  };
}
