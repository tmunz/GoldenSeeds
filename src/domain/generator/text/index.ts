import { SvgGenerator, SvgGeneratorResult } from '../SvgGenerator';
import { PointUtils } from '../../../utils/PointUtils';
import { draw, TextDrawerConfig } from './TextDrawer';

export class TextDrawer implements SvgGenerator {
  static type = 'text';
  type = TextDrawer.type;

  definition = {
    style: {
      color: {
        initial: 'gold',
        type: 'color' as const,
      },
    },
    text: {
      content: {
        initial: 'text',
        type: 'string' as const,
      },
      font: {
        initial: '/signika-bold.otf',
        type: 'font' as const,
      },
      size: {
        initial: '1',
        type: 'expression' as const,
        min: 0,
        max: 2,
        step: 0.05,
      },
    },
  };

  generate = (config: TextDrawerConfig, prev: SvgGeneratorResult): SvgGeneratorResult => {
    const drawing = draw(config, prev.grid);

    return {
      grid: prev.grid,
      svg: drawing.svg,
      boundingBox: PointUtils.combineBoundingBoxes([prev.boundingBox, drawing.boundingBox]),
    };
  };
}
