import { Stage } from '../stage/Stage';

export interface Config {
  meta: { name: string };
  stages: Stage[];
}
