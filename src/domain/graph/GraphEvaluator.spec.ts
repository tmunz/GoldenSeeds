import { GraphEvaluator, GraphCycleError } from './GraphEvaluator';
import { Graph } from './Graph';
import { GraphNode } from './GraphNode';
import { PortValue } from './PortValue';

function numberNode(id: string, value: number): GraphNode {
  return {
    id,
    kind: 'number',
    inputs: [],
    outputs: [{ id: 'out', type: 'number' }],
    config: undefined,
    evaluate: () => ({ out: { type: 'number', value } }),
  };
}

function addNode(id: string, inputIds: string[]): GraphNode {
  return {
    id,
    kind: 'add',
    inputs: inputIds.map((portId) => ({ id: portId, type: 'number' })),
    outputs: [{ id: 'out', type: 'number' }],
    config: undefined,
    evaluate: (inputs) => {
      const sum = inputIds.reduce((agg, portId) => {
        const portValue = inputs[portId];
        return agg + (portValue?.type === 'number' ? portValue.value : 0);
      }, 0);
      return { out: { type: 'number', value: sum } };
    },
  };
}

function numberOut(result: Record<string, Record<string, PortValue>>, nodeId: string): number {
  const value = result[nodeId]?.out;
  return value?.type === 'number' ? value.value : NaN;
}

describe('GraphEvaluator', () => {
  test('evaluates a linear chain in dependency order', () => {
    const graph: Graph = {
      nodes: [numberNode('a', 2), addNode('b', ['in']), addNode('c', ['in'])],
      edges: [
        { id: 'a->b', from: { nodeId: 'a', port: 'out' }, to: { nodeId: 'b', port: 'in' } },
        { id: 'b->c', from: { nodeId: 'b', port: 'out' }, to: { nodeId: 'c', port: 'in' } },
      ],
    };

    const { order, outputsByNode } = new GraphEvaluator().evaluate(graph);

    expect(order).toEqual(['a', 'b', 'c']);
    expect(numberOut(outputsByNode, 'b')).toBe(2);
    expect(numberOut(outputsByNode, 'c')).toBe(2);
  });

  test('evaluates a diamond dependency, combining multiple inputs', () => {
    const graph: Graph = {
      nodes: [
        numberNode('a', 3),
        addNode('left', ['in']),
        addNode('right', ['in']),
        addNode('sum', ['fromLeft', 'fromRight']),
      ],
      edges: [
        { id: 'a->left', from: { nodeId: 'a', port: 'out' }, to: { nodeId: 'left', port: 'in' } },
        { id: 'a->right', from: { nodeId: 'a', port: 'out' }, to: { nodeId: 'right', port: 'in' } },
        { id: 'left->sum', from: { nodeId: 'left', port: 'out' }, to: { nodeId: 'sum', port: 'fromLeft' } },
        { id: 'right->sum', from: { nodeId: 'right', port: 'out' }, to: { nodeId: 'sum', port: 'fromRight' } },
      ],
    };

    const { outputsByNode } = new GraphEvaluator().evaluate(graph);

    expect(numberOut(outputsByNode, 'sum')).toBe(6);
  });

  test('missing (unconnected) inputs are treated as undefined', () => {
    const graph: Graph = { nodes: [addNode('lonely', ['in'])], edges: [] };

    const { outputsByNode } = new GraphEvaluator().evaluate(graph);

    expect(numberOut(outputsByNode, 'lonely')).toBe(0);
  });

  test('throws GraphCycleError for cyclic graphs', () => {
    const graph: Graph = {
      nodes: [addNode('a', ['in']), addNode('b', ['in'])],
      edges: [
        { id: 'a->b', from: { nodeId: 'a', port: 'out' }, to: { nodeId: 'b', port: 'in' } },
        { id: 'b->a', from: { nodeId: 'b', port: 'out' }, to: { nodeId: 'a', port: 'in' } },
      ],
    };

    expect(() => new GraphEvaluator().evaluate(graph)).toThrow(GraphCycleError);
  });
});
