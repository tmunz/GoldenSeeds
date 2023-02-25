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

    const drawing = draw(config, prev.grid);

    const minX = drawing.points.reduce((min, p) => Math.min(p.x, min), 0);
    const maxX = drawing.points.reduce((max, p) => Math.max(p.x, max), 0);
    const minY = drawing.points.reduce((min, p) => Math.min(p.y, min), 0);
    const maxY = drawing.points.reduce((max, p) => Math.max(p.y, max), 0);

    const width = maxX - minX;
    const height = maxY - minY;

    const boundingBox = {
      x: minX,
      y: minY,
      w: width,
      h: height,
    };

    return {
      grid: drawing.points.map((p) => [
        p.x,
        p.y,
      ]),
      svg: drawing.svg,
      boundingBox,
    };
  };
}
