import { Graph } from '../model/Graph';
import { isValidConnection } from '../runtime/ConnectionValidator';

export type PortGuidance = 'origin' | 'compatible' | 'incompatible';
export interface NodePortGuidance {
  inputs: Record<string, PortGuidance>;
  outputs: Record<string, PortGuidance>;
}
export interface ConnectionOrigin { nodeId: string; port: string; direction: 'source' | 'target' }

/** Use the same validation for visual hints and the actual connection. */
export function connectionGuidance(graph: Graph, origin: ConnectionOrigin | null): Record<string, NodePortGuidance> {
  if (!origin) { return {}; }
  const guidance: Record<string, NodePortGuidance> = {};
  const start = { nodeId: origin.nodeId, port: origin.port };
  graph.nodes.forEach(node => {
    const state: NodePortGuidance = { inputs: {}, outputs: {} };
    for (const direction of ['inputs', 'outputs'] as const) {
      node[direction].forEach(port => {
        const sameDirection = (direction === 'outputs') === (origin.direction === 'source');
        const candidate = { nodeId: node.id, port: port.id };
        const valid = !sameDirection && (origin.direction === 'source'
          ? isValidConnection(graph, start, candidate)
          : isValidConnection(graph, candidate, start));
        state[direction][port.id] = sameDirection && candidate.nodeId === start.nodeId && candidate.port === start.port
          ? 'origin' : valid ? 'compatible' : 'incompatible';
      });
    }
    guidance[node.id] = state;
  });
  return guidance;
}
