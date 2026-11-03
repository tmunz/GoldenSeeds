import { DEFAULT_GENERATOR_RESULT, SvgGeneratorResult } from '../../../generator/SvgGenerator';
import type { GraphEvaluationResult } from '../../runtime/GraphEvaluator';
import { Graph } from '../../model/Graph';
import { GraphNode } from '../../model/GraphNode';
import { RESULT_PORTS, resultInputs } from '../../runtime/GraphResult';

export const RENDER_NODE_KIND = 'render';
export const RENDER_NODE_ID = 'render-output';
export const RENDER_PREVIEW_PORT = 'preview';

/** Terminal graph output combining the connected points, SVG, and bounding box. */
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

/** Read the terminal result consistently for both standalone and in-editor previews. */
export function renderNodeResult(outputs: GraphEvaluationResult['outputsByNode'] = {}): SvgGeneratorResult {
  const preview = outputs[RENDER_NODE_ID]?.[RENDER_PREVIEW_PORT];
  return preview?.type === 'svgResult' ? preview.value : DEFAULT_GENERATOR_RESULT;
}
