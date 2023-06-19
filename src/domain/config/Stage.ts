import { SvgGenerator, SvgGeneratorResult, ParamDefinition } from '../generator/SvgGenerator';
import { StageItemState } from './stageItemState/StageItemState';
import { random } from '../../utils/Random';
import { stageItemStateService } from './stageItemState/StageItemStateService';

export type StageState<T, U> = { type: string; data: Record<string, Record<string, StageItemState<T, U>>> };
export type StageRawState = { type: string; data: Record<string, Record<string, string>> };

export class Stage {
  id: string;
  generator: SvgGenerator<unknown> = {
    type: 'default',
    definition: {},
    generate: (_, prev: SvgGeneratorResult) => ({
      grid: [],
      svg: '',
      boundingBox: prev.boundingBox,
    }),
  };
  state: StageState<unknown, unknown> = { type: 'default', data: {} };
  animatedId?: string;

  constructor(stageId: string = '' + random()) {
    this.id = stageId;
  }

  async with(generator: SvgGenerator<unknown> | null, rawState?: StageRawState): Promise<Stage> {
    if (generator !== null) {
      this.generator = generator;
      this.state = await this.getFromRaw(this.generator.type, rawState?.data, this.generator.definition);
    }
    return this;
  }

  /*async convertTextToValues(): Promise<Stage> {
    const groupIds = Object.keys(this.state.data);
    await Promise.all(
      groupIds.map(
        async (groupId) =>
          await Promise.all(
            Object.keys(this.state.data[groupId]).map(async (id) => {
              const definition = this.generator.definition[groupId][id].type;
              const textValue = this.state.data[groupId][id].textValue;
              const next = await converterService.convertTextToValue(definition, textValue);
              this.state.data[groupId][id] = { ...this.state.data[groupId][id], ...next };
            }),
          ),
      ),
    );
    return this;
  }*/

  private async getFromRaw(
    type: string,
    data: Record<string, Record<string, string>> = {},
    generatorDefinition: Record<string, Record<string, ParamDefinition>>,
  ): Promise<StageState<unknown, unknown>> {
    const converted: StageState<unknown, unknown> = { type, data: {} };
    const groupIds = Object.keys(generatorDefinition);
    await Promise.all(groupIds.map(async (groupId) => {
      converted.data[groupId] = {};
      await Promise.all(Object.keys(generatorDefinition[groupId]).map(async (id) => {
        const textValue = data[groupId] ? data[groupId][id] : undefined;
        const initialTextValue = generatorDefinition[groupId][id].initial;
        const state = await stageItemStateService.createState(
          generatorDefinition[groupId][id].type,
          textValue ?? initialTextValue,
        );
        converted.data[groupId][id] = state;
      }));
    }));
    return converted;
  }
}
