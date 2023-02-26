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

    const drawing = draw(config, prev.grid);

    let minX = drawing.points.reduce((min, p) => Math.min(p[0], min), 0);
    let maxX = drawing.points.reduce((max, p) => Math.max(p[0], max), 0);
    let minY = drawing.points.reduce((min, p) => Math.min(p[1], min), 0);
    let maxY = drawing.points.reduce((max, p) => Math.max(p[1], max), 0);

    // stabilize center if all prev points are centered
    if (prev.grid.reduce((b: boolean, p: number[]) => b && p[0] === 0 && p[1] === 0, true)) {
      const extremX = Math.max(-minX, maxX);
      const extremY = Math.max(-minY, maxY);
      minX = -extremX;
      maxX = extremX;
      minY = -extremY;
      maxY = extremY;
    }

    const width = maxX - minX;
    const height = maxY - minY;

    const boundingBox = {
      x: width === 0 ? prev.boundingBox.x : minX,
      y: height === 0 ? prev.boundingBox.y : minY,
      w: width === 0 ? prev.boundingBox.w : width,
      h: height === 0 ? prev.boundingBox.h : height,
    };

    return {
      grid: drawing.points,
      svg: drawing.svg,
      boundingBox,
    };
  };
}
