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
    /*const stageKey = JSON.stringify({
      stage: stage.state,
      prevGrid: prev.grid,
      prevBoundingBox: prev.boundingBox,
    });
    if (!this.cache.has(stageKey)) {
      this.cache.set(stageKey, stage.generator.generate(stageConfig, prev));
    }
    return this.cache.get(stageKey) as SvgGeneratorResult;*/
    return stage.generator.generate(stageConfig, prev);
  }

  private convertToValue(state: StageState<any>): Record<string, Record<string, any>> {
    const values: Record<string, Record<string, any>> = {};
    Object.keys(state.data).forEach((groupId) => {
      values[groupId] = {};
      Object.keys(state.data[groupId]).forEach((id) => {
        values[groupId][id] = state.data[groupId][id].value;
      });
    });
    return values;
  }
}

export const svgGeneratorService = new SvgGeneratorService();
