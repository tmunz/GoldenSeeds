import { Graph } from '../graph/Graph';
import { GraphLayout } from '../graph/GraphLayout';

export interface Config {
  meta: { name: string };
  graph: Graph;
  layout: GraphLayout;
}
