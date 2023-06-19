import { SvgGeneratorResult } from './SvgGenerator';
import { Stage, StageState } from '../config/Stage';
import { PointUtils } from '../../utils/PointUtils';

export class SvgGeneratorService {
  static DEFAULT_RESULT: SvgGeneratorResult = {
    grid: [[0, 0]],
    svg: null,
    boundingBox: PointUtils.DEFAULT_BOUNDING_BOX,
  };

  getResult(stage: Stage, prev: SvgGeneratorResult = SvgGeneratorService.DEFAULT_RESULT): SvgGeneratorResult {
    const stageConfig = this.convertToValue(stage.state);
    return stage.generator.generate(stageConfig, prev);
  }

  private convertToValue<G>(state: StageState<G, unknown>): Record<string, Record<string, G>> {
    const values: Record<string, Record<string, G>> = {};
    Object.keys(state.data).forEach((groupId) => {
      values[groupId] = {};
      Object.keys(state.data[groupId]).forEach((id) => {
        const value = state.data[groupId][id].getValue();
        values[groupId][id] = value;
      });
    });
    return values;
  }
}

export const svgGeneratorService = new SvgGeneratorService();
