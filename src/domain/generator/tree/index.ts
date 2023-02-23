import { MathUtils } from '../../../utils/MathUtils';
import { TreeConfig, draw } from './TreeDrawer';
import { SvgGenerator, SvgGeneratorResult } from '../SvgGenerator';

export class Tree implements SvgGenerator {
  static type = 'tree';
  type = Tree.type;

  definition = {
    color: { initial: 'gold', type: 'color' as const },
    depth: {
      initial: '13',
      type: 'number' as const,
      min: 0,
      max: MathUtils.fib(7),
      step: 1,
      animateable: true,
    },
    splitAngle: {
      initial: '25',
      type: 'number' as const,
      min: 0,
      max: 90,
      step: 1,
    },
    splitVariation: {
      initial: '0.0',
      type: 'number' as const,
      min: -1,
      max: 1,
      step: 0.05,
    },
    splitProbability: {
      initial: '0.9',
      type: 'number' as const,
      min: 0,
      max: 1,
      step: 0.05,
    },
    lengthConservation: {
      initial: '0.8',
      type: 'number' as const,
      min: 0,
      max: 1,
      step: 0.05,
    },
    lengthVariation: {
      initial: '1',
      type: 'number' as const,
      min: 0,
      max: 1,
      step: 0.05,
    },
    seed: {
      initial: '0',
      type: 'number' as const,
      min: 0,
      max: 1000,
      step: 1,
      animateable: true,
    },
  };

  generate = (config: TreeConfig, prev: SvgGeneratorResult) => {
    const size = [...new Array(config.depth).keys()].reduce(
      (agg, n) => agg + Math.pow(config.lengthConservation, n),
      0,
    );
    const tree = draw(config, prev.grid);
    return {
      grid: tree.points.map((p) => [
        prev.boundingBox.x + p.x,
        prev.boundingBox.y - p.y,
      ]),
      svg: tree.svg,
      boundingBox: {
        x: prev.boundingBox.x - size / 2,
        y: prev.boundingBox.y - size,
        w: prev.boundingBox.w + size,
        h: prev.boundingBox.h + size,
      },
    };
  };
}
