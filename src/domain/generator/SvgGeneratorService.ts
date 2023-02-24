import { SvgGeneratorResult } from './SvgGenerator';
import { Stage, StageState } from '../stage/Stage';

export class SvgGeneratorService {

  static DEFAULT_RESULT: SvgGeneratorResult = {
    grid: [[0, 0]],
    svg: null,
    boundingBox: { x: 0, y: 0, w: 0, h: 0 },
  };

  private cache: Map<string, SvgGeneratorResult> = new Map();

  getResult(stage: Stage, prev: SvgGeneratorResult = SvgGeneratorService.DEFAULT_RESULT): SvgGeneratorResult { 
    const stageConfig = this.convertToValue(stage.state);
    const stageKey = JSON.stringify({ stage, prevGrid: prev.grid, prevBoundingBox: prev.boundingBox });
    if (!this.cache.has(stageKey)) {
      this.cache.set(stageKey, stage.generator.generate(stageConfig, prev));
    }
    const cachedResult = this.cache.get(stageKey) as SvgGeneratorResult;
    return cachedResult;
  }

  private convertToValue(obj: { [key: string]: StageState<any> }): {
    [key: string]: any;
  } {
    return Object.keys(obj).reduce(
      (agg, key) => ({ ...agg, [key]: obj[key].value }),
      {},
    );
  }

}

export const svgGeneratorService = new SvgGeneratorService();
