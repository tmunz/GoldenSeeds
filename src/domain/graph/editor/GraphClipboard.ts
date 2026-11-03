import { Graph } from '../model/Graph';
import { GraphEdge } from '../model/GraphEdge';
import { DEFAULT_POSITION, GraphLayout, GraphPosition } from '../model/GraphLayout';
import { GraphNode } from '../model/GraphNode';
import { RENDER_NODE_ID } from '../nodes/render/RenderNode';
import { VALUE_KIND_PREFIX } from '../nodes/value/ValueNodeRegistry';
import { RawGraphNode } from '../../config/RawConfig';
import { nodeFromRaw, nodeToRaw } from '../runtime/GraphSerializer';
import { newNodeId } from './NodeInsertion';

/** Detached copy of some nodes, the connections between them and their positions. */
export interface GraphFragment {
  nodes: RawGraphNode[];
  edges: GraphEdge[];
  positions: GraphLayout;
}

let clipboard: GraphFragment | undefined;

export function getClipboard(): GraphFragment | undefined {
  return clipboard;
}

export function setClipboard(fragment: GraphFragment | undefined): void {
  clipboard = fragment;
}

/**
 * Copy the given nodes. Value nodes that only feed copied nodes come along, so a copied stage keeps
 * its colors and formulas. Connections to anything outside the copy (including the render output) are dropped.
 */
export function collectFragment(graph: Graph, layout: GraphLayout, selectedIds: string[]): GraphFragment | undefined {
  const ids = new Set(selectedIds.filter(id => id !== RENDER_NODE_ID && graph.nodes.some(node => node.id === id)));
  if (ids.size === 0) { return undefined; }

  let grown = true;
  while (grown) {
    grown = false;
    graph.nodes.forEach(node => {
      if (ids.has(node.id) || !node.kind.startsWith(VALUE_KIND_PREFIX)) { return; }
      const outgoing = graph.edges.filter(edge => edge.from.nodeId === node.id);
      if (outgoing.length > 0 && outgoing.every(edge => ids.has(edge.to.nodeId))) {
        ids.add(node.id);
        grown = true;
      }
    });
  }

  const nodes = graph.nodes.filter(node => ids.has(node.id));
  const positions: GraphLayout = {};
  nodes.forEach(node => { positions[node.id] = layout[node.id] ?? DEFAULT_POSITION; });
  return {
    nodes: nodes.map(nodeToRaw),
    edges: graph.edges.filter(edge => ids.has(edge.from.nodeId) && ids.has(edge.to.nodeId)),
    positions,
  };
}

/** Create new, independent nodes (fresh ids and parameter state) from a fragment, moved by `offset`. */
export async function instantiateFragment(
  fragment: GraphFragment,
  takenIds: Set<string>,
  offset: GraphPosition,
): Promise<{ nodes: GraphNode[]; edges: GraphEdge[]; layout: GraphLayout }> {
  const idMap = new Map<string, string>();
  fragment.nodes.forEach(raw => {
    let id = newNodeId(raw.kind);
    while (takenIds.has(id) || [...idMap.values()].includes(id)) { id = newNodeId(raw.kind); }
    idMap.set(raw.id, id);
  });
  const mapped = (id: string) => idMap.get(id) ?? id;

  const nodes = await Promise.all(fragment.nodes.map(raw => nodeFromRaw({ ...raw, id: mapped(raw.id) })));
  const edges = fragment.edges.map(edge => ({
    id: `${mapped(edge.from.nodeId)}.${edge.from.port}->${mapped(edge.to.nodeId)}.${edge.to.port}`,
    from: { nodeId: mapped(edge.from.nodeId), port: edge.from.port },
    to: { nodeId: mapped(edge.to.nodeId), port: edge.to.port },
  }));
  const layout: GraphLayout = {};
  fragment.nodes.forEach(raw => {
    const position = fragment.positions[raw.id] ?? DEFAULT_POSITION;
    layout[mapped(raw.id)] = { x: position.x + offset.x, y: position.y + offset.y };
  });
  return { nodes, edges, layout };
}
