import { StageItemType } from "./StageItemType";
import { converterService } from "./ConverterService";

export interface StageState<T> {
  rawValue: string;
  value: T;
  valid: boolean;
}

export interface StageResult {
  grid: number[][];
  render: JSX.Element;
  boundingBox: BoundingBox;
}

export abstract class Stage {

  abstract type: string;
  abstract definition: { [key: string]: { initial: string, type: StageItemType } }
  abstract generate: (props: object, prev: StageResult) => StageResult;
  state: { [key: string]: StageState<any> };

  withState(state?: { [key: string]: string }) {
    const stateRaw: { [key: string]: string } = {
      ...Object.keys(this.definition).reduce((agg, key) => ({ ...agg, [key]: this.definition[key].initial }), {}),
      ...(state ? state : {}),
    };
    this.state = Object.keys(this.definition)
      .filter(key => key !== 'type')
      .reduce((agg, key) => ({ ...agg, [key]: converterService.convert(this.definition[key].type, stateRaw[key]) }), {});
    return this;
  };
}

