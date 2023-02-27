import { DrawStyle } from '../../../datatypes/DrawStyle';
import { MathUtils } from '../../../utils/MathUtils';
import { draw, RegularShapeConfig } from './RegularShapeDrawer';
import { SvgGenerator, SvgGeneratorResult } from '../SvgGenerator';
import { PointUtils } from '../../../utils/PointUtils';

export class RegularShape implements SvgGenerator {
  static type = 'regular-shape';
  type = RegularShape.type;

  definition = {
    color: { initial: 'gold', type: 'color' as const },
    style: {
      initial: DrawStyle.STROKE,
      type: 'selection' as const,
      options: [DrawStyle.FILLED, DrawStyle.STROKE],
    },
    corners: {
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

  generate = (config: RegularShapeConfig, prev: SvgGeneratorResult) => {
    const regularShape = draw(config, prev.grid);

    return {
      grid: prev.grid,
      svg: regularShape.svg,
      boundingBox: PointUtils.combineBoundingBoxes([prev.boundingBox, regularShape.boundingBox]),
    };
  };
}
