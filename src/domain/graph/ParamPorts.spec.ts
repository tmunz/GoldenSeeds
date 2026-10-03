import { CartesianGrid } from '../generator/cartesian';
import { Shape } from '../generator/shape';
import { GraphEvaluator } from './GraphEvaluator';
import { paramPortId } from './ParamPorts';
import { stageToGraphNode, STAGE_RESULT_PORTS } from './StageGraphAdapter';
import { generatorNodeRegistry } from './GeneratorNodeRegistry';
import { valueNodeRegistry } from './ValueNodeRegistry';
import { Stage } from '../config/Stage';

describe('ParamPorts / generator node parameter inputs', () => {
  test('generator node exposes one input port per generator parameter', async () => {
    const node = await generatorNodeRegistry.createNode('cartesian', 'cartesian-1');

    // 'grid'/'svg'/'boundingBox' result ports plus one port per param across all groups
    // (style.color, style.strokeWidth, grid.items, ...)
    expect(node.inputs).toContainEqual({ id: STAGE_RESULT_PORTS.GRID_PORT, type: 'grid' });
    expect(node.inputs).toContainEqual({ id: STAGE_RESULT_PORTS.SVG_PORT, type: 'svg' });
    expect(node.inputs).toContainEqual({ id: STAGE_RESULT_PORTS.BOUNDING_BOX_PORT, type: 'boundingBox' });
    expect(node.inputs).toContainEqual({ id: paramPortId('style', 'color'), type: 'color' });
    expect(node.inputs).toContainEqual({ id: paramPortId('style', 'strokeWidth'), type: 'expression' });
    expect(node.inputs).toContainEqual({ id: paramPortId('grid', 'items'), type: 'number' });
    expect(node.inputs.length).toBe(3 + Object.values(CartesianGrid.definition).reduce((n, g) => n + Object.keys(g).length, 0));
  });

  test('unconnected parameter ports fall back to the stage default value', async () => {
    const stage = await new Stage('cartesian-1').with(new CartesianGrid());
    const node = stageToGraphNode(stage);

    const { outputsByNode } = new GraphEvaluator().evaluate({ nodes: [node], edges: [] });
    const gridOut = outputsByNode['cartesian-1'][STAGE_RESULT_PORTS.GRID_PORT];

    expect(gridOut.type).toBe('grid');
    // default 'grid.items' is 20 -> non-empty grid/svg is produced
    expect(gridOut.type === 'grid' && gridOut.value.length).toBeGreaterThan(0);
  });

  test('a connected number value node overrides the parameter (grid.items) for evaluation', async () => {
    const stage = await new Stage('cartesian-1').with(new CartesianGrid());
    const generatorNode = stageToGraphNode(stage);
    const itemsValueNode = await valueNodeRegistry.createNode('number', 'items-1', '4');

    const graphWithOverride = {
      nodes: [itemsValueNode, generatorNode],
      edges: [
        {
          id: 'items-1->cartesian-1',
          from: { nodeId: 'items-1', port: 'out' },
          to: { nodeId: 'cartesian-1', port: paramPortId('grid', 'items') },
        },
      ],
    };

    const { outputsByNode } = new GraphEvaluator().evaluate(graphWithOverride);
    const overriddenOut = outputsByNode['cartesian-1'][STAGE_RESULT_PORTS.GRID_PORT];

    const { outputsByNode: baselineOutputs } = new GraphEvaluator().evaluate({ nodes: [generatorNode], edges: [] });
    const baselineOut = baselineOutputs['cartesian-1'][STAGE_RESULT_PORTS.GRID_PORT];

    expect(overriddenOut).not.toEqual(baselineOut);
    expect(overriddenOut.type === 'grid' && overriddenOut.value.length).toBe(4);
  });

  test('a connected color value node overrides a color parameter (style.fillColor) on a shape node', async () => {
    const stage = await new Stage('shape-1').with(new Shape());
    const generatorNode = stageToGraphNode(stage);
    const colorValueNode = await valueNodeRegistry.createNode('color', 'color-1', 'red');

    const { outputsByNode } = new GraphEvaluator().evaluate({
      nodes: [colorValueNode, generatorNode],
      edges: [
        {
          id: 'color-1->shape-1',
          from: { nodeId: 'color-1', port: 'out' },
          to: { nodeId: 'shape-1', port: paramPortId('style', 'fillColor') },
        },
      ],
    });

    const out = outputsByNode['shape-1'][STAGE_RESULT_PORTS.SVG_PORT];
    expect(out.type).toBe('svg');
    expect(out.type === 'svg' && out.value).toEqual(expect.stringContaining('fill="#ff0000"'));
  });
});

describe('ValueNodeRegistry', () => {
  test('creates a number value node', async () => {
    const node = await valueNodeRegistry.createNode('number', 'n-1', '42');
    expect(node.outputs).toEqual([{ id: 'out', type: 'number' }]);
    const { outputsByNode } = new GraphEvaluator().evaluate({ nodes: [node], edges: [] });
    expect(outputsByNode['n-1'].out).toEqual({ type: 'number', value: 42 });
  });

  test('creates a color value node', async () => {
    const node = await valueNodeRegistry.createNode('color', 'c-1', 'gold');
    expect(node.outputs).toEqual([{ id: 'out', type: 'color' }]);
    const { outputsByNode } = new GraphEvaluator().evaluate({ nodes: [node], edges: [] });
    const out = outputsByNode['c-1'].out;
    expect(out.type).toBe('color');
    expect(out.type === 'color' && out.value.isValid()).toBe(true);
  });

  test('creates an expression value node whose value is a callable function', async () => {
    const node = await valueNodeRegistry.createNode('expression', 'e-1', 'n * 2');
    expect(node.outputs).toEqual([{ id: 'out', type: 'expression' }]);
    const { outputsByNode } = new GraphEvaluator().evaluate({ nodes: [node], edges: [] });
    const out = outputsByNode['e-1'].out;
    expect(out.type).toBe('expression');
    expect(out.type === 'expression' && out.value(3, 10, (n: number) => n, 1)).toBe(6);
  });

  test('creates a string value node', async () => {
    const node = await valueNodeRegistry.createNode('string', 's-1', 'hello');
    const { outputsByNode } = new GraphEvaluator().evaluate({ nodes: [node], edges: [] });
    expect(outputsByNode['s-1'].out).toEqual({ type: 'string', value: 'hello' });
  });
});
