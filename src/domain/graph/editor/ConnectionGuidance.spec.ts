import { connectionGuidance } from './ConnectionGuidance';
import { Graph } from '../model/Graph';
import { GraphNode } from '../model/GraphNode';
import { isValidConnection } from '../runtime/ConnectionValidator';

function node(id: string, type: 'number' | 'color'): GraphNode {
  return { id, kind: 'test', inputs: [{ id: 'in', type }], outputs: [{ id: 'out', type }], config: undefined, evaluate: () => ({}) };
}
const graph: Graph = { nodes: [node('a', 'number'), node('b', 'number'), node('color', 'color')], edges: [] };

test('guidance highlights compatible targets and dims incompatible and same-direction ports', () => {
  const hints = connectionGuidance(graph, { nodeId: 'a', port: 'out', direction: 'source' });
  expect(hints.a.outputs.out).toBe('origin');
  expect(hints.b.inputs.in).toBe('compatible');
  expect(hints.color.inputs.in).toBe('incompatible');
  expect(hints.b.outputs.out).toBe('incompatible');
  expect(hints.a.inputs.in).toBe('incompatible');
});

test('starting from an input highlights compatible outputs', () => {
  const hints = connectionGuidance(graph, { nodeId: 'b', port: 'in', direction: 'target' });
  expect(hints.b.inputs.in).toBe('origin');
  expect(hints.a.outputs.out).toBe('compatible');
  expect(hints.color.outputs.out).toBe('incompatible');
});

test('cycles are rejected and dimmed by the same validation', () => {
  const connected = { ...graph, edges: [{ id: 'a-b', from: { nodeId: 'a', port: 'out' }, to: { nodeId: 'b', port: 'in' } }] };
  expect(isValidConnection(connected, { nodeId: 'b', port: 'out' }, { nodeId: 'a', port: 'in' })).toBe(false);
  expect(connectionGuidance(connected, { nodeId: 'b', port: 'out', direction: 'source' }).a.inputs.in).toBe('incompatible');
});

test('idle connections leave ports in their normal state', () => {
  expect(connectionGuidance(graph, null)).toEqual({});
});
