import { Graph } from './Graph';
import { GraphPortRef } from './GraphEdge';
import { PortValueType } from './PortValue';

/**
 * Returns whether a connection from an output port to an input port is allowed:
 * both nodes/ports must exist, the source port must be one of the node's outputs,
 * the target port must be one of the node's inputs, and their PortValueType must match.
 */
export function isValidConnection(graph: Graph, from: GraphPortRef, to: GraphPortRef): boolean {
  const fromType = findPortType(graph, from.nodeId, from.port, 'outputs');
  const toType = findPortType(graph, to.nodeId, to.port, 'inputs');
  return fromType !== undefined && toType !== undefined && fromType === toType;
}

function findPortType(
  graph: Graph,
  nodeId: string,
  portId: string,
  direction: 'inputs' | 'outputs',
): PortValueType | undefined {
  const node = graph.nodes.find((n) => n.id === nodeId);
  return node?.[direction].find((port) => port.id === portId)?.type;
}
