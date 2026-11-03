import { GraphNode } from '../model/GraphNode';
import { GraphEdge } from '../model/GraphEdge';
import { RENDER_NODE_ID, RENDER_NODE_KIND } from '../nodes/render/RenderNode';
import { VALUE_KIND_PREFIX } from '../nodes/value/ValueNodeRegistry';
import { connectResultPorts } from '../runtime/GraphResult';

/** Generates a short, unique-enough node id, e.g. "shape-ab12c". */
export function newNodeId(kind: string): string {
  return `${kind}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Only an unconnected graph gets a starter connection to its render output. */
export function connectionsForAddedNode(node: Pick<GraphNode, 'id' | 'kind'>, hasConnections: boolean): GraphEdge[] {
  if (hasConnections || node.kind === RENDER_NODE_KIND || node.kind.startsWith(VALUE_KIND_PREFIX)) { return []; }
  return connectResultPorts(node.id, RENDER_NODE_ID);
}
