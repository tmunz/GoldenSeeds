import { converterService } from "../converter/ConverterService";
import { SvgGenerator } from "../generator/SvgGenerator";

export interface StageState<T> {
  rawValue: string;
  value: T;
  valid: boolean;
}

export class Stage {

  generator: SvgGenerator;
  state: { [key: string]: StageState<any> };

  constructor(generator: SvgGenerator, state?: { [key: string]: string }) {
    this.generator = generator;
    this.state = this.makeState(state);
  }

  private makeState(state?: { [key: string]: string }) {
    const stateRaw: { [key: string]: string } = {
      ...Object.keys(this.generator.definition).reduce((agg, key) => ({ ...agg, [key]: this.generator.definition[key].initial }), {}),
      ...(state ? state : {}),
    };
    return Object.keys(this.generator.definition)
      .filter(key => key !== 'type')
      .reduce((agg, key) => ({ ...agg, [key]: converterService.convert(this.generator.definition[key].type, stateRaw[key]) }), {});
  }
}
