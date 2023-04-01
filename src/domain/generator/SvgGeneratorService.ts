import { SvgGeneratorResult } from './SvgGenerator';
import { Stage, StageState } from '../stage/Stage';
import { PointUtils } from '../../utils/PointUtils';
import { MapCache } from '../../utils/MapCache';

export class SvgGeneratorService {
  static DEFAULT_RESULT: SvgGeneratorResult = {
    grid: [[0, 0]],
    svg: null,
    boundingBox: PointUtils.DEFAULT_BOUNDING_BOX,
  };

  private cache: MapCache<string, SvgGeneratorResult> = new MapCache(10);

  getResult(stage: Stage, prev: SvgGeneratorResult = SvgGeneratorService.DEFAULT_RESULT): SvgGeneratorResult {
    const stageConfig = this.convertToValue(stage.state);
    const stageKey = JSON.stringify({
      stage: stage.state,
      prevGrid: prev.grid,
      prevBoundingBox: prev.boundingBox,
    });
    if (!this.cache.has(stageKey)) {
      this.cache.set(stageKey, stage.generator.generate(stageConfig, prev));
    }
    return this.cache.get(stageKey) as SvgGeneratorResult;
  }

  private convertToValue(obj: { [key: string]: StageState<any> }): {
    [key: string]: any;
  } {
    return Object.keys(obj).reduce((agg, key) => ({ ...agg, [key]: obj[key].value }), {});
  }
}

export const svgGeneratorService = new SvgGeneratorService();
