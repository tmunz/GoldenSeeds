import { Graph } from './Graph';
import { GraphNode } from './GraphNode';
import { RESULT_PORTS, resultInputs } from './GraphResult';

export const RENDER_NODE_KIND = 'render';
export const RENDER_NODE_ID = 'render-output';
export const RENDER_PREVIEW_PORT = 'preview';

/** Terminal graph output combining the connected grid, SVG, and bounding box. */
export function createRenderNode(): GraphNode {
  return {
    id: RENDER_NODE_ID,
    kind: RENDER_NODE_KIND,
    inputs: RESULT_PORTS,
    outputs: [{ id: RENDER_PREVIEW_PORT, type: 'svgResult' }],
    config: undefined,
    evaluate: (inputs) => ({ [RENDER_PREVIEW_PORT]: { type: 'svgResult', value: resultInputs(inputs) } }),
  };
}

/** Guarantees a graph always has a render node, without auto-connecting anything. */
export function ensureRenderNode(graph: Graph): Graph {
  return graph.nodes.some((node) => node.id === RENDER_NODE_ID)
    ? graph
    : { ...graph, nodes: [...graph.nodes, createRenderNode()] };
}
