import { Converter } from '../converter';

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
  abstract converter: { [key: string]: Converter<any> };
  abstract initialState: { [key: string]: string }
  abstract generate: (props: object, prev: StageResult) => StageResult;
  state: { [key: string]: StageState<any> };

  withState = (state?: { [key: string]: string }) => {
    const stateRaw = state ? state : this.initialState;
    this.state = Object.keys(stateRaw)
      .filter(key => key !== 'type')
      .reduce((agg, key) => ({ ...agg, [key]: this.converter[key].convert(stateRaw[key]) }), {});
    return this;
  };
}

