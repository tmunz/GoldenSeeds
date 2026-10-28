import { GraphEvaluator } from './GraphEvaluator';
import { generatorNodeRegistry } from './GeneratorNodeRegistry';

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
      expect(node.inputs).toContainEqual({ id: 'grid', type: 'grid' });
      expect(node.inputs).toContainEqual({ id: 'svg', type: 'svg' });
      expect(node.inputs).toContainEqual({ id: 'boundingBox', type: 'boundingBox' });
      expect(node.outputs).toEqual([
        { id: 'grid', type: 'grid' },
        { id: 'svg', type: 'svg' },
        { id: 'boundingBox', type: 'boundingBox' },
      ]);

      const { outputsByNode } = new GraphEvaluator().evaluate({ nodes: [node], edges: [] });
      const svgOut = outputsByNode[node.id]['svg'];

      expect(svgOut.type).toBe('svg');
      expect(svgOut.type === 'svg' && typeof svgOut.value).toBe('string');
    },
  );

  test('chains two generator nodes together via an edge, like the linear pipeline', async () => {
    const cartesian = await generatorNodeRegistry.createNode('cartesian', 'cartesian-1');
    const shape = await generatorNodeRegistry.createNode('shape', 'shape-1');

    const { order, outputsByNode } = new GraphEvaluator().evaluate({
      nodes: [cartesian, shape],
      edges: [
        {
          id: 'cartesian-1->shape-1',
          from: { nodeId: 'cartesian-1', port: 'svg' },
          to: { nodeId: 'shape-1', port: 'svg' },
        },
      ],
    });

    expect(order).toEqual(['cartesian-1', 'shape-1']);
    const shapeOut = outputsByNode['shape-1']['svg'];
    expect(shapeOut.type === 'svg' && shapeOut.value?.length).toBeGreaterThan(0);
  });

  test('function nodes expose generated points without an output selector', async () => {
    const node = await generatorNodeRegistry.createNode('function', 'plot', {
      plot: { items: '3', start: '1', functionX: 'n * 2', functionY: 'n + 1' },
      style: { resolution: '2' },
    });
    expect(node.inputs.some((port) => port.id === 'param:plot.output')).toBe(false);
    const output = node.evaluate({ grid: { type: 'grid', value: [[10, 20]] } });
    expect(output.grid).toEqual({ type: 'grid', value: [[12, 18], [14, 17], [16, 16]] });
  });

  test('rejects unknown generator kinds', async () => {
    await expect(generatorNodeRegistry.createNode('does-not-exist', 'x-1')).rejects.toThrow(
      'Unknown generator kind: does-not-exist',
    );
  });
});
