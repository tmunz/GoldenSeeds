import { MathUtils } from '../../../utils/MathUtils';
import { PointUtils } from '../../../utils/PointUtils';
import { draw, ShapeConfig } from './ShapeDrawer';
import { SvgGenerator, SvgGeneratorResult } from '../SvgGenerator';

export class Shape extends SvgGenerator<ShapeConfig> {
  static type = 'shape';

  static definition = {
    style: {
      fillColor: { initial: 'transparent', type: 'color' as const },
      strokeColor: { initial: 'gold', type: 'color' as const },
      strokeWidth: {
        initial: '1',
        type: 'number' as const,
        min: 0,
        max: 10,
        step: 0.1,
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
        step: 0.01,
      },
    },
    projection: {
      type: {
        initial: 'circular',
        type: 'selection' as const,
        options: ['linear', 'circular'],
      },
      circlularProjectionFullAngle: {
        initial: '360',
        type: 'number' as const,
        min: -3 * 360,
        max: +3 * 360,
        step: 1,
      },
    },
    shape: {
      edges: {
        initial: '1',
        type: 'number' as const,
        min: 1,
        max: MathUtils.fib(12),
        step: 1,
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
    },
    probabilityDistribution: {
      muRandomness: {
        initial: '0',
        type: 'number' as const,
        min: 0,
        max: 1,
        step: 0.05,
      },
      sigma: {
        initial: '0',
        type: 'number' as const,
        min: 0,
        max: 1,
        step: 0.05,
      },
      sigmaRandomness: {
        initial: '0',
        type: 'number' as const,
        min: 0,
        max: 1,
        step: 0.05,
      },
      noise: {
        initial: '0',
        type: 'number' as const,
        min: 0,
        max: 1,
        step: 0.05,
      },
    },
    variation: {
      seed: {
        initial: '999',
        type: 'number' as const,
        min: 0,
        max: 999,
        step: 1,
        animateable: true,
      },
    },
    transformation: {
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
    },
  };
  
  constructor() {
    super(Shape.type, Shape.definition);
  }

  generate = (config: ShapeConfig, prev: SvgGeneratorResult) => {
    const shape = draw(config, prev.grid);

    return {
      grid: prev.grid,
      svg: shape.svg,
      boundingBox: PointUtils.combineBoundingBoxes([prev.boundingBox, shape.boundingBox]),
    };
  };
}
