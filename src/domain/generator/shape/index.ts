import { DrawStyle } from '../../../datatypes/DrawStyle';
import { MathUtils } from '../../../utils/MathUtils';
import { draw, ShapeConfig } from './ShapeDrawer';
import { SvgGenerator, SvgGeneratorResult } from '../SvgGenerator';
import { PointUtils } from '../../../utils/PointUtils';

export class Shape implements SvgGenerator {
  static type = 'shape';
  type = Shape.type;

  definition = {
    color: { initial: 'gold', type: 'color' as const },
    style: {
      initial: DrawStyle.STROKE,
      type: 'selection' as const,
      options: [DrawStyle.FILLED, DrawStyle.STROKE],
    },
    coordinateType: {
      initial: 'cartesian',
      type: 'selection' as const,
      options: ['cartesian', 'polar'],
    },
    midpoints: {
      initial: '0',
      type: 'number' as const,
      min: 0,
      max: MathUtils.fib(8),
      step: 1,
    },
    angle: {
      initial: '0',
      type: 'expression' as const,
      min: 0,
      max: 360,
      step: 1,
    },
    size: {
      initial: '1',
      type: 'expression' as const,
      min: 0,
      max: 100,
      step: 0.1,
    },
    ratio: {
      initial: '1',
      type: 'expression' as const,
      min: 0,
      max: 2,
      step: 0.05,
    },
    cutRatio0: {
      initial: '0',
      type: 'expression' as const,
      min: 0,
      max: 1,
      step: 0.05,
    },
    cutRatio1: {
      initial: '0',
      type: 'expression' as const,
      min: 0,
      max: 1,
      step: 0.05,
    },
  };

  generate = (config: ShapeConfig, prev: SvgGeneratorResult) => {
    const shape = draw(config, prev.grid);

    return {
      grid: prev.grid,
      svg: shape.svg,
      boundingBox: PointUtils.combineBoundingBoxes([prev.boundingBox, shape.boundingBox]),
    };
  };
}
