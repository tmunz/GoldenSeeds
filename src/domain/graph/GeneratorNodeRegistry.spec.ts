import { GraphEvaluator } from './GraphEvaluator';
import { generatorNodeRegistry } from './GeneratorNodeRegistry';
import { STAGE_RESULT_PORTS } from './StageGraphAdapter';

describe('GeneratorNodeRegistry', () => {
  test('exposes all registered generator kinds', () => {
    expect(generatorNodeRegistry.kinds.sort()).toEqual(
      ['cartesian', 'function', 'polar', 'shape', 'text', 'tree', 'voronoi'].sort(),
    );
  });

  // 'text' is excluded here: FontState resolves fonts via IndexedDB/fetch, which
  // aren't available in the default Jest (node) test environment.
  test.each(['shape', 'cartesian', 'polar', 'voronoi', 'tree', 'function'])(
    'creates and evaluates a %s node with its default parameters',
    async (kind) => {
      const node = await generatorNodeRegistry.createNode(kind, `${kind}-1`);

      expect(node.kind).toBe(kind);
      expect(node.inputs).toContainEqual({ id: STAGE_RESULT_PORTS.GRID_PORT, type: 'grid' });
      expect(node.inputs).toContainEqual({ id: STAGE_RESULT_PORTS.SVG_PORT, type: 'svg' });
      expect(node.inputs).toContainEqual({ id: STAGE_RESULT_PORTS.BOUNDING_BOX_PORT, type: 'boundingBox' });
      expect(node.outputs).toEqual([
        { id: STAGE_RESULT_PORTS.GRID_PORT, type: 'grid' },
        { id: STAGE_RESULT_PORTS.SVG_PORT, type: 'svg' },
        { id: STAGE_RESULT_PORTS.BOUNDING_BOX_PORT, type: 'boundingBox' },
      ]);

      const { outputsByNode } = new GraphEvaluator().evaluate({ nodes: [node], edges: [] });
      const svgOut = outputsByNode[node.id][STAGE_RESULT_PORTS.SVG_PORT];

      expect(svgOut.type).toBe('svg');
      expect(svgOut.type === 'svg' && typeof svgOut.value).toBe('string');
    },
  );

  test('creates a default node using the registry default generator', async () => {
    const node = await generatorNodeRegistry.createDefaultNode('default-1');
    expect(node.kind).toBe('shape');
  });

  test('chains two generator nodes together via an edge, like the linear pipeline', async () => {
    const cartesian = await generatorNodeRegistry.createNode('cartesian', 'cartesian-1');
    const shape = await generatorNodeRegistry.createNode('shape', 'shape-1');

    const { order, outputsByNode } = new GraphEvaluator().evaluate({
      nodes: [cartesian, shape],
      edges: [
        {
          id: 'cartesian-1->shape-1',
          from: { nodeId: 'cartesian-1', port: STAGE_RESULT_PORTS.SVG_PORT },
          to: { nodeId: 'shape-1', port: STAGE_RESULT_PORTS.SVG_PORT },
        },
      ],
    });

    expect(order).toEqual(['cartesian-1', 'shape-1']);
    const shapeOut = outputsByNode['shape-1'][STAGE_RESULT_PORTS.SVG_PORT];
    expect(shapeOut.type === 'svg' && shapeOut.value?.length).toBeGreaterThan(0);
  });

  test('rejects unknown generator kinds', async () => {
    await expect(generatorNodeRegistry.createNode('does-not-exist', 'x-1')).rejects.toThrow(
      'Unknown generator kind: does-not-exist',
    );
  });
});
