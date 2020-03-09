import { Grid } from './stage/grid/Grid';
import { Background } from './stage/background/Background';
import { Drawer } from './stage/drawer/Drawer';

export interface StageState<T> {
  rawValue: string;
  value: T;
  valid: boolean;
}

export interface Config {
  meta: { name: string };
  grid: Grid;
  background: Background;
  drawer: Drawer;
}
