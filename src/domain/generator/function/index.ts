import { MathUtils } from '../../../utils/MathUtils';
import { SvgGenerator, SvgGeneratorResult } from '../SvgGenerator';
import { PointUtils } from '../../../utils/PointUtils';
import { plot, FunctionPlotterConfig } from './FunctionPlotter';

export class FunctionPlotter implements SvgGenerator {
  static type = 'function';
  type = FunctionPlotter.type;

  definition = {
    color: { initial: 'gold', type: 'color' as const },
    strokeWidth: {
      initial: '1',
      type: 'expression' as const,
      min: 0,
      max: 10,
      step: 0.05,
    },
    output: {
      initial: 'generated',
      type: 'selection' as const,
      options: ['origin', 'generated'],
    },
    start: {
      initial: '0',
      type: 'number' as const,
      min: -100,
      max: 100,
      step: 1,
      animateable: true,
    },
    items: {
      initial: '10',
      type: 'number' as const,
      min: 1,
      max: MathUtils.fib(16),
      step: 1,
      animateable: true,
    },
    functionX: {
      initial: 'n',
      type: 'expression' as const,
      min: -10,
      max: 10,
      step: 0.1,
    },
    functionY: {
      initial: 'Math.sin(n)',
      type: 'expression' as const,
      min: -10,
      max: 10,
      step: 0.1,
    },
    resolution: {
      initial: '10',
      type: 'number' as const,
      min: 1,
      max: 10,
      step: 1,
    },
  };

  generate = (config: FunctionPlotterConfig, prev: SvgGeneratorResult): SvgGeneratorResult => {
    const plotting = plot(config, prev.grid);
    return {
      grid: config.output === 'origin' ? prev.grid : plotting.points,
      svg: plotting.svg,
      boundingBox: PointUtils.combineBoundingBoxes([prev.boundingBox, PointUtils.boundingBox(plotting.points)]),
    };
  };
}
