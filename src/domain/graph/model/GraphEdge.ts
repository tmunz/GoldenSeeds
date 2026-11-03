export interface GraphPortRef {
  nodeId: string;
  port: string;
}

export interface GraphEdge {
  id: string;
  from: GraphPortRef;
  to: GraphPortRef;
}
