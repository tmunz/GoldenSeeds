import { DEFAULT_GENERATOR_RESULT } from '../../../generator/SvgGenerator';
import { createGeneratorNode } from './GeneratorNode';
import { generatorNodeRegistry } from './GeneratorNodeRegistry';
import { graphEvaluator } from '../../runtime/GraphEvaluator';
import { connectResultPorts } from '../../runtime/GraphResult';

describe('generator node evaluation', () => {
  test('preserves incoming SVG before the generated SVG and passes result fields through', () => {
    const generated = { points: [[3, 4]], svg: '<circle/>', boundingBox: { min: [0, 0], max: [5, 5] } };
    const generate = jest.fn(() => generated);
    const node = createGeneratorNode('drawing', {
      generator: { type: 'test', definition: {}, generate }, parameters: {},
    });
    const points = [[1, 2]];
    const boundingBox = { min: [-1, -1], max: [2, 2] };
    expect(node.evaluate({
      points: { type: 'points', value: points },
      svg: { type: 'svg', value: '<path/>' },
      boundingBox: { type: 'boundingBox', value: boundingBox },
    })).toEqual({
      points: { type: 'points', value: generated.points },
      svg: { type: 'svg', value: '<path/><circle/>' },
      boundingBox: { type: 'boundingBox', value: generated.boundingBox },
    });
    expect(generate).toHaveBeenCalledWith({}, { points, svg: '<path/>', boundingBox });
  });

  test('unconnected fields fall back to the default result', () => {
    const generate = jest.fn(() => DEFAULT_GENERATOR_RESULT);
    const node = createGeneratorNode('drawing', {
      generator: { type: 'test', definition: {}, generate }, parameters: {},
    });
    node.evaluate({});
    expect(generate).toHaveBeenCalledWith({}, DEFAULT_GENERATOR_RESULT);
  });

  test('connected generators preserve the upstream SVG and points', async () => {
    const points = await generatorNodeRegistry.createNode('cartesian', 'points', { grid: { items: '4', x: '2' } });
    const shape = await generatorNodeRegistry.createNode('shape', 'shape', { style: { fillColor: 'red' } });
    const { outputsByNode } = graphEvaluator.evaluate({ nodes: [points, shape], edges: connectResultPorts('points', 'shape') });
    expect(outputsByNode.shape.points).toEqual(outputsByNode.points.points);
    expect(outputsByNode.shape.points).toEqual({ type: 'points', value: [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]] });
    const upstream = outputsByNode.points.svg;
    const output = outputsByNode.shape.svg;
    expect(upstream.type === 'svg' && output.type === 'svg' && output.value?.startsWith(upstream.value ?? '')).toBe(true);
    expect(output.type === 'svg' && output.value).toContain('fill="#ff0000"');
  });
});
