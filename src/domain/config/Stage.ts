import { converterService } from '../converter/ConverterService';
import { SvgGenerator, SvgGeneratorResult, ParamDefinition } from '../generator/SvgGenerator';
import { random } from '../../utils/Random';

export interface StageItemState<T> {
  textValue: string;
  value: T | null;
  valid: boolean;
}

export type StageState<T> = { type: string; data: Record<string, Record<string, StageItemState<T>>> };
export type StageRawState = { type: string; data: Record<string, Record<string, string>> };

export class Stage {
  id: string;
  generator: SvgGenerator<unknown>;
  state: StageState<unknown>;
  animatedId?: string;

  constructor(
    generator: SvgGenerator<unknown> | null,
    rawState: StageRawState = { type: 'default', data: {} },
    stageId: string = '' + random(),
  ) {
    this.id = stageId;
    this.generator = generator ?? {
      type: 'default',
      definition: {},
      generate: (_, prev: SvgGeneratorResult) => ({
        grid: [],
        svg: '',
        boundingBox: prev.boundingBox,
      }),
    };
    this.state = this.getFromRaw(this.generator.type, rawState.data, this.generator.definition);
  }

  async convertTextToValues(): Promise<Stage> {
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
  }

  private getFromRaw(
    type: string,
    data: Record<string, Record<string, string>> = {},
    generatorDefinition: Record<string, Record<string, ParamDefinition>>,
  ): StageState<unknown> {
    const converted: StageState<unknown> = { type, data: {} };
    const groupIds = Object.keys(generatorDefinition);
    groupIds.forEach((groupId) => {
      converted.data[groupId] = {};
      Object.keys(generatorDefinition[groupId]).forEach((id) => {
        const textValue = data[groupId] ? data[groupId][id] : undefined;
        const initialTextValue = generatorDefinition[groupId][id].initial;
        converted.data[groupId][id] = {
          textValue: textValue ?? initialTextValue,
          value: null,
          valid: false,
        };
      });
    });
    return converted;
  }
}
