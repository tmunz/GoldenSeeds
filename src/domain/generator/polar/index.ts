import { MathUtils } from '../../../utils/MathUtils';
import { SvgGenerator, SvgGeneratorResult } from '../SvgGenerator';
import { draw, PolarConfig } from './PolarDrawer';
import { PointUtils } from '../../../utils/PointUtils';

export class PolarGrid extends SvgGenerator<PolarConfig> {
  static type = 'polar';

  static definition = {
    style: {
      color: { initial: 'transparent', type: 'color' as const },
      strokeWidth: {
        initial: '1',
        type: 'expression' as const,
        min: 0,
        max: 10,
        step: 0.05,
      },
    },
    grid: {
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
    },
  };

  constructor() {
    super(PolarGrid.type, PolarGrid.definition);
  }

  generate(config: PolarConfig, prev: SvgGeneratorResult): SvgGeneratorResult {
    const drawing = draw(config, prev.grid);

    const drawingBoundingBox = PointUtils.boundingBox(drawing.points);

    return {
      grid: drawing.points,
      svg: drawing.svg,
      boundingBox: PointUtils.combineBoundingBoxes([prev.boundingBox, drawingBoundingBox]),
    };
  }
}
