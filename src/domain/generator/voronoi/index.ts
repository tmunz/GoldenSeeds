import { VoronoiConfig, draw } from './VoronoiDrawer';
import { SvgGenerator, SvgGeneratorResult } from '../SvgGenerator';

export class Voronoi extends SvgGenerator<VoronoiConfig> {
  static type = 'voronoi';

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
    },
    cells: {
      gap: {
        initial: '0.1',
        type: 'number' as const,
        min: 0,
        max: 10,
        step: 0.1,
      },
    },
  };

  constructor() {
    super(Voronoi.type, Voronoi.definition);
  }

  generate(config: VoronoiConfig, prev: SvgGeneratorResult) {
    return {
      boundingBox: prev.boundingBox,
      svg: draw(config, prev.grid, prev.boundingBox),
      grid: prev.grid,
    };
  }
}
