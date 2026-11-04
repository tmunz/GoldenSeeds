import { valueNodeRegistry, ValueNodeConfig } from './ValueNodeRegistry';
import { generatorNodeRegistry } from '../generator/GeneratorNodeRegistry';
import { GraphEvaluator } from '../../runtime/GraphEvaluator';
import { isValidConnection } from '../../runtime/ConnectionValidator';
import { editGraphNode } from '../../editor/NodeEditing';
import { fromRawConfig, toRawConfig } from '../../runtime/GraphSerializer';

const text = '[1,1], [2,2], [3,5.6]';
const points = [[1, 1], [2, 2], [3, 5.6]];

test('points values connect to generator point inputs and reach the drawing', async () => {
  const source = await valueNodeRegistry.createNode('points', 'source', text);
  const shape = await generatorNodeRegistry.createNode('shape', 'shape');
  const graph = { nodes: [source, shape], edges: [{
    id: 'points->shape', from: { nodeId: 'source', port: 'out' }, to: { nodeId: 'shape', port: 'points' },
  }] };
  expect(source.inputs).toEqual([]);
  expect(source.outputs).toEqual([{ id: 'out', type: 'points' }]);
  expect(isValidConnection(graph, graph.edges[0].from, graph.edges[0].to)).toBe(true);
  expect(isValidConnection(graph, graph.edges[0].from, { nodeId: 'shape', port: 'svg' })).toBe(false);
  const output = new GraphEvaluator().evaluate(graph).outputsByNode;
  expect(output.source.out).toEqual({ type: 'points', value: points });
  expect(output.shape.points).toEqual({ type: 'points', value: points });
  expect(output.shape.svg.type === 'svg' && output.shape.svg.value).toContain('cx="3" cy="5.6"');
});

test('point edits preserve snapshots and reject malformed input', async () => {
  const original = await valueNodeRegistry.createNode('points', 'source', text);
  const edited = editGraphNode(original, { kind: 'value', text: '[[4,5]]' });
  expect(edited).not.toBe(original);
  expect((original.config as ValueNodeConfig).state.getValue()).toEqual(points);
  expect((edited.config as ValueNodeConfig).state.getValue()).toEqual([[4, 5]]);
  expect(editGraphNode(edited, { kind: 'value', text: '[4,' })).toBe(edited);
});

test('point values and connections survive save/load with the typed format intact', async () => {
  const source = await valueNodeRegistry.createNode('points', 'source', text);
  const shape = await generatorNodeRegistry.createNode('shape', 'shape');
  const config = { meta: { name: 'points' }, graph: { nodes: [source, shape], edges: [{
    id: 'points->shape', from: { nodeId: 'source', port: 'out' }, to: { nodeId: 'shape', port: 'points' },
  }] }, layout: {} };
  const raw = toRawConfig(config);
  expect(raw.nodes[0]).toEqual({ id: 'source', kind: 'value:points', value: text });
  const restored = await fromRawConfig(raw);
  expect(new GraphEvaluator().evaluate(restored.graph).outputsByNode.shape.points).toEqual({ type: 'points', value: points });
});


test('generators cannot reorder the points stored in a value node', async () => {
  const source = await valueNodeRegistry.createNode('points', 'source', text);
  const voronoi = await generatorNodeRegistry.createNode('voronoi', 'voronoi');
  voronoi.evaluate({
    points: source.evaluate({}).out,
    boundingBox: { type: 'boundingBox', value: { min: [0, 0], max: [10, 10] } },
  });
  expect((source.config as ValueNodeConfig).state.getValue()).toEqual(points);
});
