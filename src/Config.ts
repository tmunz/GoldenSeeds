import { Stage } from "./stage/Stage";

export interface StageState<T> {
  rawValue: string;
  value: T;
  valid: boolean;
}

export interface Config {
  meta: { name: string };
  stages: Stage[];
}
