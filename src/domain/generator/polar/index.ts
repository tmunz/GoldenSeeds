import { MathUtils } from '../../../utils/MathUtils';
import { SvgGenerator, SvgGeneratorResult } from '../SvgGenerator';
import { draw, PolarConfig } from './PolarDrawer';
import { PointUtils } from '../../../utils/PointUtils';

export class PolarGrid implements SvgGenerator {
  static type = 'polar';
  type = PolarGrid.type;

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
      initial: '21',
      type: 'number' as const,
      min: 1,
      max: MathUtils.fib(16),
      step: 1,
      animateable: true,
    },
    angle: {
      initial: 'n * 360 / goldenRatio',
      type: 'expression' as const,
      min: 0,
      max: 360,
      step: 1,
    },
    distance: {
      initial: 'Math.pow(n, 1 / goldenRatio)',
      type: 'expression' as const,
      min: 0,
      max: 100,
      step: 0.05,
    },
  };

  generate = (
    config: PolarConfig,
    prev: SvgGeneratorResult,
  ): SvgGeneratorResult => {
    const drawing = draw(config, prev.grid);

    let drawingBoundingBox = PointUtils.boundingBox(drawing.points);

    // stabilize center if all prev points are centered
    if (
      prev.grid.reduce(
        (b: boolean, p: number[]) => b && p[0] === 0 && p[1] === 0,
        true,
      )
    ) {
      const extremeX = Math.max(-drawingBoundingBox.min[0], drawingBoundingBox.max[0]);
      const extremeY = Math.max(-drawingBoundingBox.min[1], drawingBoundingBox.max[1]);
      drawingBoundingBox = {
        min: [-extremeX, -extremeY],
        max: [extremeX, extremeY]
      };
    }

    return {
      grid: drawing.points,
      svg: drawing.svg,
      boundingBox: PointUtils.combineBoundingBoxes([prev.boundingBox, drawingBoundingBox]),
    };
  };
}
