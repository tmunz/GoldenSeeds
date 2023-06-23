import { SvgGenerator, SvgGeneratorResult } from '../SvgGenerator';
import { PointUtils } from '../../../utils/PointUtils';
import { draw, TextDrawerConfig } from './TextDrawer';

export class TextDrawer extends SvgGenerator<TextDrawerConfig> {
  static type = 'text';

  static definition = {
    style: {
      color: {
        initial: 'gold',
        type: 'color' as const,
      },
      font: {
        initial: 'Signika-Bold',
        type: 'font' as const,
      },
    },
    text: {
      content: {
        initial: 'text',
        type: 'string' as const,
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

  constructor() {
    super(TextDrawer.type, TextDrawer.definition);
  }

  generate = (config: TextDrawerConfig, prev: SvgGeneratorResult): SvgGeneratorResult => {
    const drawing = draw(config, prev.grid);

    return {
      grid: prev.grid,
      svg: drawing.svg,
      boundingBox: PointUtils.combineBoundingBoxes([prev.boundingBox, drawing.boundingBox]),
    };
  };
}
