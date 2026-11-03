import { Graph } from '../model/Graph';
import { GraphPortRef } from '../model/GraphEdge';
import { PortValueType } from '../model/PortValue';

/**
 * Returns whether a connection from an output port to an input port is allowed:
 * both nodes/ports must exist, the source port must be one of the node's outputs,
 * the target port must be one of the node's inputs, and their PortValueType must match.
 */
export function isValidConnection(graph: Graph, from: GraphPortRef, to: GraphPortRef): boolean {
  const fromType = findPortType(graph, from.nodeId, from.port, 'outputs');
  const toType = findPortType(graph, to.nodeId, to.port, 'inputs');
  if (fromType === undefined || toType === undefined || fromType !== toType || from.nodeId === to.nodeId) { return false; }
  // Connecting replaces the target port's old edge. Reject any resulting cycle.
  const adjacency = new Map<string, string[]>();
  graph.edges.filter(edge => edge.to.nodeId !== to.nodeId || edge.to.port !== to.port).forEach(edge => {
    const targets = adjacency.get(edge.from.nodeId) ?? [];
    targets.push(edge.to.nodeId);
    adjacency.set(edge.from.nodeId, targets);
  });
  const pending = [to.nodeId];
  const visited = new Set<string>();
  while (pending.length) {
    const current = pending.pop();
    if (current === undefined) { continue; }
    if (current === from.nodeId) { return false; }
    if (visited.has(current)) { continue; }
    visited.add(current);
    pending.push(...(adjacency.get(current) ?? []));
  }
  return true;
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
