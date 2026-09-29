import { GraphNode } from './GraphNode';
import { GraphEdge } from './GraphEdge';

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
