import { DEFAULT_DISTRIBUTION_TEXT } from '../../../datatypes/ProbabilityDistribution';
import { MathUtils } from '../../../utils/MathUtils';
import { PointUtils } from '../../../utils/PointUtils';
import { draw, ShapeConfig } from './ShapeDrawer';
import { SvgGenerator, SvgGeneratorResult } from '../SvgGenerator';

export class Shape extends SvgGenerator<ShapeConfig> {
  static type = 'shape';

  static definition = {
    style: {
      fillColor: { initial: 'transparent', type: 'color' as const },
      strokeColor: { initial: 'transparent', type: 'color' as const },
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
      distribution: { initial: DEFAULT_DISTRIBUTION_TEXT, type: 'distribution' as const },
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
        min: 0,
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
