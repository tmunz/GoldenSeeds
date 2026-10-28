import { DEFAULT_GENERATOR_RESULT } from '../generator/SvgGenerator';
import { generatorNodeRegistry } from './GeneratorNodeRegistry';
import { graphEvaluator } from './GraphEvaluator';
import { connectResultPorts, RESULT_PORTS } from './GraphResult';
import { ensureRenderNode, createRenderNode, RENDER_NODE_ID, RENDER_PREVIEW_PORT } from './RenderNode';
import { Graph } from './Graph';

describe('RenderNode', () => {
  test('has result input ports and a single combined preview output', () => {
    const node = createRenderNode();
    expect(node.id).toBe(RENDER_NODE_ID);
    expect(node.inputs).toEqual(RESULT_PORTS);
    expect(node.outputs).toEqual([{ id: RENDER_PREVIEW_PORT, type: 'svgResult' }]);
  });

  test('falls back to the default result when nothing is connected', () => {
    expect(createRenderNode().evaluate({})).toEqual({
      [RENDER_PREVIEW_PORT]: { type: 'svgResult', value: DEFAULT_GENERATOR_RESULT },
    });
  });

  test('combines connected grid, SVG, and bounding box inputs', () => {
    const grid = [[1, 2]];
    const svg = '<svg/>';
    const boundingBox = { min: [0, 0], max: [1, 1] };
    expect(createRenderNode().evaluate({
      grid: { type: 'grid', value: grid }, svg: { type: 'svg', value: svg },
      boundingBox: { type: 'boundingBox', value: boundingBox },
    })).toEqual({ [RENDER_PREVIEW_PORT]: { type: 'svgResult', value: { grid, svg, boundingBox } } });
  });

  test('adds a missing render node without connecting it', () => {
    const result = ensureRenderNode({ nodes: [], edges: [] });
    expect(result.nodes.map((node) => node.id)).toEqual([RENDER_NODE_ID]);
    expect(result.edges).toEqual([]);
  });

  test('preserves graphs that already contain a render node', () => {
    const graph: Graph = { nodes: [createRenderNode()], edges: [] };
    expect(ensureRenderNode(graph)).toBe(graph);
  });

  test('exposes a connected generator output as the final preview', async () => {
    const node = await generatorNodeRegistry.createNode('cartesian', 'grid');
    const graph = ensureRenderNode({ nodes: [node], edges: connectResultPorts(node.id, RENDER_NODE_ID) });
    const { outputsByNode } = graphEvaluator.evaluate(graph);
    expect(outputsByNode[RENDER_NODE_ID][RENDER_PREVIEW_PORT]).toEqual({
      type: 'svgResult', value: {
        grid: outputsByNode.grid.grid.value,
        svg: outputsByNode.grid.svg.value,
        boundingBox: outputsByNode.grid.boundingBox.value,
      },
    });
  });
});
