import { Stage } from '../config/Stage';
import { CartesianGrid } from '../generator/cartesian';
import { SvgGeneratorService, svgGeneratorService } from '../generator/SvgGeneratorService';
import { GraphEvaluator } from './GraphEvaluator';
import { stagesToGraph, LEGACY_STAGE_PORTS } from './LegacyStageAdapter';
import {
  appendRenderNode,
  ensureRenderNode,
  createRenderNode,
  RENDER_NODE_ID,
  RENDER_IN_GRID_PORT,
  RENDER_IN_SVG_PORT,
  RENDER_IN_BOUNDING_BOX_PORT,
  RENDER_PREVIEW_PORT,
} from './RenderNode';
import { Graph } from './Graph';

describe('RenderNode', () => {
  test('createRenderNode has grid/svg/boundingBox input ports and a single svgResult out port', () => {
    const node = createRenderNode();

    expect(node.id).toBe(RENDER_NODE_ID);
    expect(node.inputs).toEqual([
      { id: RENDER_IN_GRID_PORT, type: 'grid' },
      { id: RENDER_IN_SVG_PORT, type: 'svg' },
      { id: RENDER_IN_BOUNDING_BOX_PORT, type: 'boundingBox' },
    ]);
    expect(node.outputs).toEqual([{ id: RENDER_PREVIEW_PORT, type: 'svgResult' }]);
  });

  test('evaluate falls back to the default result when nothing is connected', () => {
    const node = createRenderNode();
    expect(node.evaluate({})).toEqual({
      [RENDER_PREVIEW_PORT]: { type: 'svgResult', value: SvgGeneratorService.DEFAULT_RESULT },
    });
  });

  test('evaluate combines connected grid/svg/boundingBox inputs', () => {
    const node = createRenderNode();
    const grid = [[1, 2]];
    const svg = '<svg/>';
    const boundingBox = { min: [0, 0], max: [1, 1] };

    expect(
      node.evaluate({
        [RENDER_IN_GRID_PORT]: { type: 'grid', value: grid },
        [RENDER_IN_SVG_PORT]: { type: 'svg', value: svg },
        [RENDER_IN_BOUNDING_BOX_PORT]: { type: 'boundingBox', value: boundingBox },
      }),
    ).toEqual({
      [RENDER_PREVIEW_PORT]: { type: 'svgResult', value: { grid, svg, boundingBox } },
    });
  });

  test('appendRenderNode adds the node without connecting it when no source is given', () => {
    const graph: Graph = { nodes: [], edges: [] };
    const result = appendRenderNode(graph);

    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].id).toBe(RENDER_NODE_ID);
    expect(result.edges).toEqual([]);
  });

  test("appendRenderNode auto-connects the given node id's grid/svg/boundingBox outputs to the render node", () => {
    const graph: Graph = { nodes: [], edges: [] };
    const result = appendRenderNode(graph, 'shape-1');

    expect(result.edges).toEqual([
      {
        id: 'shape-1.grid->render-output.grid',
        from: { nodeId: 'shape-1', port: LEGACY_STAGE_PORTS.GRID_PORT },
        to: { nodeId: RENDER_NODE_ID, port: RENDER_IN_GRID_PORT },
      },
      {
        id: 'shape-1.svg->render-output.svg',
        from: { nodeId: 'shape-1', port: LEGACY_STAGE_PORTS.SVG_PORT },
        to: { nodeId: RENDER_NODE_ID, port: RENDER_IN_SVG_PORT },
      },
      {
        id: 'shape-1.boundingBox->render-output.boundingBox',
        from: { nodeId: 'shape-1', port: LEGACY_STAGE_PORTS.BOUNDING_BOX_PORT },
        to: { nodeId: RENDER_NODE_ID, port: RENDER_IN_BOUNDING_BOX_PORT },
      },
    ]);
  });

  test('appendRenderNode/ensureRenderNode is a no-op if a render node already exists', () => {
    const graph: Graph = { nodes: [createRenderNode()], edges: [] };

    expect(ensureRenderNode(graph)).toBe(graph);
    expect(appendRenderNode(graph, 'shape-1')).toBe(graph);
  });

  test('evaluating a legacy stage graph with an appended render node exposes the final SVG on the render node', async () => {
    const cartesianStage = await new Stage('cartesian-1').with(new CartesianGrid());
    const expected = svgGeneratorService.getResult(cartesianStage, SvgGeneratorService.DEFAULT_RESULT);

    const graph = appendRenderNode(stagesToGraph([cartesianStage]), 'cartesian-1');
    const { outputsByNode } = new GraphEvaluator().evaluate(graph);

    expect(outputsByNode[RENDER_NODE_ID][RENDER_PREVIEW_PORT]).toEqual({ type: 'svgResult', value: expected });
  });
});
