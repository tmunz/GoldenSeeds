import { MathUtils } from '../../../utils/MathUtils';
import { draw, ShapeConfig } from './ShapeDrawer';
import { SvgGenerator, SvgGeneratorResult } from '../SvgGenerator';
import { PointUtils } from '../../../utils/PointUtils';

export class Shape implements SvgGenerator {
  static type = 'shape';
  type = Shape.type;

  definition = {
    border: { initial: 'gold', type: 'color' as const },
    fill: { initial: 'transparent', type: 'color' as const },
    coordinateType: {
      initial: 'cartesian',
      type: 'selection' as const,
      options: ['cartesian', 'polar'],
    },
    edges: {
      initial: '1',
      type: 'number' as const,
      min: 1,
      max: MathUtils.fib(12),
      step: 1,
    },
    smoothness: {
      initial: '0.5',
      type: 'expression' as const,
      min: 0,
      max: 2,
      step: 0.05,
    },
    noise: {
      initial: '0',
      type: 'number' as const,
      min: 0,
      max: 1,
      step: 0.05,
    },
    probabilityDistributionMuRandomness: {
      initial: '0',
      type: 'number' as const,
      min: 0,
      max: 1,
      step: 0.05,
    },
    probabilityDistributionSigma: {
      initial: '0',
      type: 'number' as const,
      min: 0,
      max: 1,
      step: 0.05,
    },
    probabilityDistributionSigmaRandomness: {
      initial: '0',
      type: 'number' as const,
      min: 0,
      max: 1,
      step: 0.05,
    },
    probabilityDistributionNoise: {
      initial: '0',
      type: 'number' as const,
      min: 0,
      max: 1,
      step: 0.05,
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
      min: 0.05,
      max: 100,
      step: 0.05,
    },
    offset: {
      initial: '0',
      type: 'expression' as const,
      min: -1,
      max: 1,
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
    seed: {
      initial: '999',
      type: 'number' as const,
      min: 0,
      max: 999,
      step: 1,
      animateable: true,
    },
  };

  generate = (config: ShapeConfig, prev: SvgGeneratorResult) => {
    const shape = draw(config, prev.grid);

    return {
      grid: prev.grid,
      svg: shape.svg,
      boundingBox: PointUtils.combineBoundingBoxes([
        prev.boundingBox,
        shape.boundingBox,
      ]),
    };
  };
}
