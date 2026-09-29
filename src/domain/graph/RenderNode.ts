import { SvgGeneratorService } from '../generator/SvgGeneratorService';
import { Graph } from './Graph';
import { GraphEdge } from './GraphEdge';
import { GraphNode } from './GraphNode';
import { LEGACY_STAGE_PORTS } from './LegacyStageAdapter';

export const RENDER_NODE_KIND = 'render';
export const RENDER_NODE_ID = 'render-output';
export const RENDER_IN_GRID_PORT = 'grid';
export const RENDER_IN_SVG_PORT = 'svg';
export const RENDER_IN_BOUNDING_BOX_PORT = 'boundingBox';
export const RENDER_PREVIEW_PORT = 'preview';

/**
 * The graph's terminal node: always present and never deletable (see GraphCanvas/GraphFlowAdapter).
 * It has the same three input ports as every generator node's result ports (grid/svg/boundingBox,
 * see LegacyStageAdapter) so it can be connected directly to any node's output. Whatever is
 * connected (or the individual field's default, for anything left unconnected) is combined into
 * a single `preview` output that GraphView/RenderNodeView display via SvgCanvas.
 */
export function createRenderNode(): GraphNode {
  return {
    id: RENDER_NODE_ID,
    kind: RENDER_NODE_KIND,
    inputs: [
      { id: RENDER_IN_GRID_PORT, type: 'grid' },
      { id: RENDER_IN_SVG_PORT, type: 'svg' },
      { id: RENDER_IN_BOUNDING_BOX_PORT, type: 'boundingBox' },
    ],
    outputs: [{ id: RENDER_PREVIEW_PORT, type: 'svgResult' }],
    config: undefined,
    evaluate: (inputs) => {
      const gridInput = inputs[RENDER_IN_GRID_PORT];
      const svgInput = inputs[RENDER_IN_SVG_PORT];
      const boundingBoxInput = inputs[RENDER_IN_BOUNDING_BOX_PORT];
      const value = {
        grid: gridInput?.type === 'grid' ? gridInput.value : SvgGeneratorService.DEFAULT_RESULT.grid,
        svg: svgInput?.type === 'svg' ? svgInput.value : SvgGeneratorService.DEFAULT_RESULT.svg,
        boundingBox: boundingBoxInput?.type === 'boundingBox' ? boundingBoxInput.value : SvgGeneratorService.DEFAULT_RESULT.boundingBox,
      };
      return { [RENDER_PREVIEW_PORT]: { type: 'svgResult', value } };
    },
  };
}

/**
 * Appends the terminal render node to a graph, optionally auto-connecting the grid/svg/boundingBox
 * outputs of `connectFromNodeId` (e.g. the last legacy stage) into its matching input ports so
 * existing configs still show their previous output without the user having to wire it up by hand.
 * Does nothing if a render node is already present.
 */
export function appendRenderNode(graph: Graph, connectFromNodeId?: string): Graph {
  if (graph.nodes.some((node) => node.id === RENDER_NODE_ID)) {
    return graph;
  }

  const edges = [...graph.edges];
  if (connectFromNodeId) {
    const renderInputPorts: Record<string, string> = {
      [LEGACY_STAGE_PORTS.GRID_PORT]: RENDER_IN_GRID_PORT,
      [LEGACY_STAGE_PORTS.SVG_PORT]: RENDER_IN_SVG_PORT,
      [LEGACY_STAGE_PORTS.BOUNDING_BOX_PORT]: RENDER_IN_BOUNDING_BOX_PORT,
    };
    LEGACY_STAGE_PORTS.RESULT_PORTS.forEach((port) => {
      const edge: GraphEdge = {
        id: `${connectFromNodeId}.${port}->${RENDER_NODE_ID}.${renderInputPorts[port]}`,
        from: { nodeId: connectFromNodeId, port },
        to: { nodeId: RENDER_NODE_ID, port: renderInputPorts[port] },
      };
      edges.push(edge);
    });
  }

  return { nodes: [...graph.nodes, createRenderNode()], edges };
}

/** Guarantees a graph always has a render node, without auto-connecting anything. */
export function ensureRenderNode(graph: Graph): Graph {
  return appendRenderNode(graph);
}
