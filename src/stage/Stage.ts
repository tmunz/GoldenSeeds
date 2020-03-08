import { Converter } from "../converter";

export interface StageState<T> {
  rawValue: string,
  value: T,
  valid: boolean,
}

export abstract class Stage<T, U = {}> {

  abstract type: string;
  abstract converter: { [key: string]: Converter<any> };
  abstract initialState: { [key: string]: string }
  abstract generate: (props: object, prev?: {result: U, boundingBox: BoundingBox}) => { result: T, boundingBox: BoundingBox };
  state: { [key: string]: StageState<any> };

  withState = (state?: { [key: string]: string }) => {
    const stateRaw = state ? state : this.initialState;
    this.state = Object.keys(stateRaw)
      .filter(key => key !== "type")
      .reduce((agg, key) => ({ ...agg, [key]: this.converter[key].convert(stateRaw[key]) }), {});
    return this;
  };
};

