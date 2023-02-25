import { SvgGenerator, SvgGeneratorResult } from '../SvgGenerator';
import { CartesianConfig, draw } from './CartesianDrawer';

export class CartesianGrid implements SvgGenerator {
  static type = 'cartesian';
  type = CartesianGrid.type;

  definition = {
    color: { initial: 'gold', type: 'color' as const },
    strokeWidth: {
      initial: '1',
      type: 'expression' as const,
      min: 0,
      max: 10,
      step: 0.05,
    },
    x: { initial: '5', type: 'number' as const, min: 1, max: 25, step: 1 },
    items: {
      initial: '20',
      type: 'number' as const,
      min: 1,
      max: 625,
      step: 1,
      animateable: true,
    },
  };

  generate = (config: CartesianConfig, prev: SvgGeneratorResult): SvgGeneratorResult => {

    const drawing = draw(config, prev.grid);

    const minX = drawing.points.reduce((min, p) => Math.min(p[0], min), 0);
    const maxX = drawing.points.reduce((max, p) => Math.max(p[0], max), 0);
    const minY = drawing.points.reduce((min, p) => Math.min(p[1], min), 0);
    const maxY = drawing.points.reduce((max, p) => Math.max(p[1], max), 0);

    const width = maxX - minX;
    const height = maxY - minY;

    const boundingBox = {
      x: width === 0 ? prev.boundingBox.x : minX,
      y: height === 0 ? prev.boundingBox.y : minY ,
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

