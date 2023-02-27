import { converterService } from '../converter/ConverterService';
import { SvgGenerator, SvgGeneratorResult } from '../generator/SvgGenerator';
import { v4 as uuid } from 'uuid';

export interface StageState<T> {
  rawValue: string;
  value: T;
  valid: boolean;
}

export class Stage {
  id: string;
  generator: SvgGenerator;
  state: { [key: string]: StageState<any> };
  animatedId?: string;

  constructor(
    generator: SvgGenerator | null,
    state?: { [key: string]: string },
    stageId: string = uuid(),
  ) {
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
    this.state = this.initialState(state);
  }

  private initialState(state?: { [key: string]: string }) {
    const stateRaw: { [key: string]: string } = {
      ...Object.keys(this.generator.definition).reduce(
        (agg, key) => ({
          ...agg,
          [key]: this.generator.definition[key].initial,
        }),
        {},
      ),
      ...(state ? state : {}),
    };
    return Object.keys(this.generator.definition)
      .filter((key) => key !== 'type')
      .reduce(
        (agg, key) => ({
          ...agg,
          [key]: converterService.convert(
            this.generator.definition[key].type,
            stateRaw[key],
          ),
        }),
        {},
      );
  }
}
