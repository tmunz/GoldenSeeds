import { isValidConnection } from './ConnectionValidator';
import { Graph } from './Graph';
import { GraphNode } from './GraphNode';

function node(id: string, inputs: GraphNode['inputs'], outputs: GraphNode['outputs']): GraphNode {
  return { id, kind: 'test', inputs, outputs, config: undefined, evaluate: () => ({}) };
}

describe('isValidConnection', () => {
  const graph: Graph = {
    nodes: [
      node('numberSource', [], [{ id: 'out', type: 'number' }]),
      node('colorSource', [], [{ id: 'out', type: 'color' }]),
      node('target', [{ id: 'in', type: 'number' }], []),
    ],
    edges: [],
  };

  test('allows a connection when source and target port types match', () => {
    expect(isValidConnection(graph, { nodeId: 'numberSource', port: 'out' }, { nodeId: 'target', port: 'in' })).toBe(
      true,
    );
  });

  test('rejects a connection when source and target port types differ', () => {
    expect(isValidConnection(graph, { nodeId: 'colorSource', port: 'out' }, { nodeId: 'target', port: 'in' })).toBe(
      false,
    );
  });

  test('rejects a connection referencing an unknown node', () => {
    expect(isValidConnection(graph, { nodeId: 'missing', port: 'out' }, { nodeId: 'target', port: 'in' })).toBe(
      false,
    );
  });

  test('rejects a connection referencing an unknown port', () => {
    expect(
      isValidConnection(graph, { nodeId: 'numberSource', port: 'nope' }, { nodeId: 'target', port: 'in' }),
    ).toBe(false);
  });
});
