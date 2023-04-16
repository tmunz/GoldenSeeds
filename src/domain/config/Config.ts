import { Stage } from '../config/Stage';

export interface Config {
  meta: { name: string };
  stages: Stage[];
}
