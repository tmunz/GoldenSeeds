import { Graph } from '../graph/model/Graph';
import { GraphLayout } from '../graph/model/GraphLayout';

export interface Config {
  meta: { name: string };
  graph: Graph;
  layout: GraphLayout;
}
