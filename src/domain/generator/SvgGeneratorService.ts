import { SvgGeneratorResult } from './SvgGenerator';
import { Stage, StageState } from '../config/Stage';
import { PointUtils } from '../../utils/PointUtils';
// import { MapCache } from '../../utils/MapCache';

export class SvgGeneratorService {
  static DEFAULT_RESULT: SvgGeneratorResult = {
    grid: [[0, 0]],
    svg: null,
    boundingBox: PointUtils.DEFAULT_BOUNDING_BOX,
  };

  // private cache: MapCache<string, SvgGeneratorResult> = new MapCache(10);

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

  private convertToValue<T>(state: StageState<T>): Record<string, Record<string, T>> {
    const values: Record<string, Record<string, T>> = {};
    Object.keys(state.data).forEach((groupId) => {
      values[groupId] = {};
      Object.keys(state.data[groupId]).forEach((id) => {
        const value = state.data[groupId][id].value;
        if (value !== null && value !== undefined) {
          values[groupId][id] = value;
        }
      });
    });
    return values;
  }
}

export const svgGeneratorService = new SvgGeneratorService();
