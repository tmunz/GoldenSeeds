import { MathUtils } from '../../../utils/MathUtils';
import { SvgGenerator, SvgGeneratorResult } from '../SvgGenerator';
import { draw, PolarConfig } from './PolarDrawer';

export class PolarGrid implements SvgGenerator {
  static type = 'polar';
  type = PolarGrid.type;

  definition = {
    color: { initial: 'gold', type: 'color' as const },
    strokeWidth: {
      initial: '1',
      type: 'expression' as const,
      min: 0,
      max: 10,
      step: 0.05,
    },
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
  };

  generate = (config: PolarConfig, prev: SvgGeneratorResult): SvgGeneratorResult => {

    const tree = draw(config, prev.grid);

    const minX = tree.points.reduce((min, p) => Math.min(p[0], min), 0);
    const maxX = tree.points.reduce((max, p) => Math.max(p[0], max), 0);
    const minY = tree.points.reduce((min, p) => Math.min(p[0], min), 0);
    const maxY = tree.points.reduce((max, p) => Math.max(p[0], max), 0);

    const width = maxX - minX;
    const height = maxY - minY;

    const boundingBox = {
      x: width === 0 ? prev.boundingBox.x : minX,
      y: height === 0 ? prev.boundingBox.y : minY,
      w: width === 0 ? prev.boundingBox.w : width,
      h: height === 0 ? prev.boundingBox.h : height,
    };

    return {
      grid: tree.points,
      svg: tree.svg,
      boundingBox,
    };
  };
}
