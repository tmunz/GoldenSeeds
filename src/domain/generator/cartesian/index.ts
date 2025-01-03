import { SvgGenerator, SvgGeneratorResult, ParamDefinition } from '../SvgGenerator';
import { CartesianConfig, draw } from './CartesianDrawer';
import { PointUtils } from '../../../utils/PointUtils';

export class CartesianGrid extends SvgGenerator<CartesianConfig> {
  static type = 'cartesian';

  static definition: Record<string, Record<string, ParamDefinition>> = {
    style: {
      color: { initial: 'gold', type: 'color' as const },
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
        initial: '20',
        type: 'number' as const,
        min: 1,
        max: 625,
        step: 1,
        animateable: true,
      },
      x: { initial: '5', type: 'number' as const, min: 1, max: 25, step: 1 },
      xOffset: {
        initial: '0',
        type: 'number' as const,
        min: -10,
        max: 10,
        step: 0.05,
      },
      yOffset: {
        initial: '0',
        type: 'number' as const,
        min: -10,
        max: 10,
        step: 0.05,
      },
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
    },
  };

  constructor() {
    super(CartesianGrid.type, CartesianGrid.definition);
  }

  generate(config: CartesianConfig, prev: SvgGeneratorResult): SvgGeneratorResult {
    const drawing = draw(config, prev.grid);
    return {
      grid: drawing.points,
      svg: drawing.svg,
      boundingBox: PointUtils.combineBoundingBoxes([prev.boundingBox, PointUtils.boundingBox(drawing.points)]),
    };
  }
}
