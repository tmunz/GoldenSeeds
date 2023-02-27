import { SvgGenerator, SvgGeneratorResult } from '../SvgGenerator';
import { CartesianConfig, draw } from './CartesianDrawer';
import { PointUtils } from '../../../utils/PointUtils';

export class CartesianGrid implements SvgGenerator {
  static type = 'cartesian';
  type = CartesianGrid.type;

  definition = {
    color: { initial: 'gold', type: 'color' as const },
    strokeWidth: {
      initial: '1',
      type: 'expression' as const,
      min: 0,
      max: 10,
      step: 0.05,
    },
    x: { initial: '5', type: 'number' as const, min: 1, max: 25, step: 1 },
    xDistance: {
      initial: '1',
      type: 'expression' as const,
      min: 0,
      max: 2,
      step: 0.05,
    },
    yDistance: {
      initial: '1',
      type: 'expression' as const,
      min: 0,
      max: 2,
      step: 0.05,
    },
    items: {
      initial: '20',
      type: 'number' as const,
      min: 1,
      max: 625,
      step: 1,
      animateable: true,
    },
  };

  generate = (
    config: CartesianConfig,
    prev: SvgGeneratorResult,
  ): SvgGeneratorResult => {
    const drawing = draw(config, prev.grid);

    return {
      grid: drawing.points,
      svg: drawing.svg,
      boundingBox: PointUtils.combineBoundingBoxes([prev.boundingBox, PointUtils.boundingBox(drawing.points)]),
    };
  };
}
