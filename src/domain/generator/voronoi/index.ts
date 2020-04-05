import { VoronoiConfig, draw } from './VoronoiDrawer';
import { DrawStyle } from '../../../datatypes/DrawStyle';
import { SvgGenerator, SvgGeneratorResult } from '../SvgGenerator';


export class Voronoi implements SvgGenerator {

  static type = 'voronoi';
  type = Voronoi.type;

  definition = {
    color: { initial: 'gold', type: 'color' as const },
    style: { initial: DrawStyle.STROKE, type: 'selection' as const, options: [DrawStyle.FILLED, DrawStyle.STROKE] },
    borderWidth: { initial: '2', type: 'number' as const, min: 0, max: 10, step: 1 },
  };

  generate = (config: VoronoiConfig, prev: SvgGeneratorResult) => {
    return {
      boundingBox: prev.boundingBox,
      svg: draw(config, prev.grid),
      grid: prev.grid,
    };
  }
}
