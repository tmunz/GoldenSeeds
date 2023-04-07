import { converterService } from '../converter/ConverterService';
import { SvgGenerator, SvgGeneratorResult, ParamDefinition } from '../generator/SvgGenerator';
import { random } from '../../utils/Random';

export interface StageItemState<T> {
  rawValue: string;
  value: T;
  valid: boolean;
}

export type StageState<T> = { type: string, data: Record<string, Record<string, StageItemState<T>>> };
export type StageRawState = { type: string, data: Record<string, Record<string, string>> };

export class Stage {
  id: string;
  generator: SvgGenerator;
  state: StageState<any>;
  animatedId?: string;

  constructor(generator: SvgGenerator | null, rawState: StageRawState = { type: 'default', data: {} }, stageId: string = '' + random()) {
    this.id = stageId;
    this.generator = generator ?? {
      type: 'default',
      definition: {},
      generate: (props: any, prev: SvgGeneratorResult) => ({
        grid: [],
        svg: null,
        boundingBox: prev.boundingBox,
      }),
    };
    this.state = this.getFromRaw(rawState.type, rawState.data, this.generator.definition);
  }

  getFromRaw(type: string, data: Record<string, Record<string, string>> = {}, generatorDefinition: Record<string, Record<string, ParamDefinition>>): StageState<any> {
    const converted: StageState<any> = { type, data: {} };
    const groupIds = Object.keys(generatorDefinition);
    groupIds.forEach(groupId => {
      converted.data[groupId] = {};
      Object.keys(generatorDefinition[groupId]).forEach((id) => {
        const initialValue = generatorDefinition[groupId][id].initial;
        const rawValue = data[groupId] ? data[groupId][id] : undefined;
        converted.data[groupId][id] = converterService.convert(generatorDefinition[groupId][id].type, rawValue ?? initialValue);
      });
    });
    return converted;
  }
}
