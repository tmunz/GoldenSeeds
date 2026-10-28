import { DEFAULT_GENERATOR_RESULT } from '../generator/SvgGenerator';
import { createGeneratorNode } from './GeneratorNode';
import { generatorNodeRegistry } from './GeneratorNodeRegistry';
import { graphEvaluator } from './GraphEvaluator';
import { connectResultPorts } from './GraphResult';

describe('generator node evaluation', () => {
  test('preserves incoming SVG before the generated SVG and passes result fields through', () => {
    const generated = { grid: [[3, 4]], svg: '<circle/>', boundingBox: { min: [0, 0], max: [5, 5] } };
    const generate = jest.fn(() => generated);
    const node = createGeneratorNode('drawing', {
      generator: { type: 'test', definition: {}, generate }, parameters: {},
    });
    const grid = [[1, 2]];
    const boundingBox = { min: [-1, -1], max: [2, 2] };
    expect(node.evaluate({
      grid: { type: 'grid', value: grid },
      svg: { type: 'svg', value: '<path/>' },
      boundingBox: { type: 'boundingBox', value: boundingBox },
    })).toEqual({
      grid: { type: 'grid', value: generated.grid },
      svg: { type: 'svg', value: '<path/><circle/>' },
      boundingBox: { type: 'boundingBox', value: generated.boundingBox },
    });
    expect(generate).toHaveBeenCalledWith({}, { grid, svg: '<path/>', boundingBox });
  });

  test('unconnected fields fall back to the default result', () => {
    const generate = jest.fn(() => DEFAULT_GENERATOR_RESULT);
    const node = createGeneratorNode('drawing', {
      generator: { type: 'test', definition: {}, generate }, parameters: {},
    });
    node.evaluate({});
    expect(generate).toHaveBeenCalledWith({}, DEFAULT_GENERATOR_RESULT);
  });

  test('connected generators preserve the upstream SVG and grid', async () => {
    const grid = await generatorNodeRegistry.createNode('cartesian', 'grid', { grid: { items: '4', x: '2' } });
    const shape = await generatorNodeRegistry.createNode('shape', 'shape', { style: { fillColor: 'red' } });
    const { outputsByNode } = graphEvaluator.evaluate({ nodes: [grid, shape], edges: connectResultPorts('grid', 'shape') });
    expect(outputsByNode.shape.grid).toEqual(outputsByNode.grid.grid);
    expect(outputsByNode.shape.grid).toEqual({ type: 'grid', value: [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]] });
    const upstream = outputsByNode.grid.svg;
    const output = outputsByNode.shape.svg;
    expect(upstream.type === 'svg' && output.type === 'svg' && output.value?.startsWith(upstream.value ?? '')).toBe(true);
    expect(output.type === 'svg' && output.value).toContain('fill="#ff0000"');
  });
});
