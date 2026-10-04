import {
  graphNodeToFlowNode,
  graphToFlowNodes,
  graphEdgeToFlowEdge,
  graphToFlowEdges,
  flowEdgeToGraphEdge,
  flowNodesToLayout,
  GRAPH_NODE_TYPE,
} from './GraphFlowAdapter';
import { GraphNode } from './GraphNode';
import { Graph } from './Graph';

function numberNode(id: string): GraphNode {
  return {
    id,
    kind: 'number',
    inputs: [],
    outputs: [{ id: 'out', type: 'number' }],
    config: undefined,
    evaluate: () => ({ out: { type: 'number', value: 1 } }),
  };
}

describe('GraphFlowAdapter', () => {
  test('graphNodeToFlowNode uses the default position when none is given', () => {
    const node = numberNode('a');
    const flowNode = graphNodeToFlowNode(node);

    expect(flowNode).toEqual({
      id: 'a',
      type: GRAPH_NODE_TYPE,
      position: { x: 0, y: 0 },
      data: { graphNode: node },
      deletable: true,
      dragHandle: '.graph-node-header',
    });
  });

  test('graphToFlowNodes applies positions from the layout', () => {
    const graph: Graph = { nodes: [numberNode('a'), numberNode('b')], edges: [] };
    const flowNodes = graphToFlowNodes(graph, { a: { x: 10, y: 20 } });

    expect(flowNodes.find((n) => n.id === 'a')?.position).toEqual({ x: 10, y: 20 });
    expect(flowNodes.find((n) => n.id === 'b')?.position).toEqual({ x: 0, y: 0 });
  });

  test('graphEdgeToFlowEdge maps named ports to source/target handles', () => {
    const flowEdge = graphEdgeToFlowEdge({
      id: 'a->b',
      from: { nodeId: 'a', port: 'out' },
      to: { nodeId: 'b', port: 'in' },
    });

    expect(flowEdge).toEqual({ id: 'a->b', source: 'a', sourceHandle: 'out', target: 'b', targetHandle: 'in' });
  });

  test('graphToFlowEdges converts every edge in the graph', () => {
    const graph: Graph = {
      nodes: [],
      edges: [
        { id: 'e1', from: { nodeId: 'a', port: 'out' }, to: { nodeId: 'b', port: 'in' } },
        { id: 'e2', from: { nodeId: 'b', port: 'out' }, to: { nodeId: 'c', port: 'in' } },
      ],
    };

    expect(graphToFlowEdges(graph)).toHaveLength(2);
  });

  test('flowEdgeToGraphEdge round-trips a graphEdgeToFlowEdge result', () => {
    const original = { id: 'a->b', from: { nodeId: 'a', port: 'out' }, to: { nodeId: 'b', port: 'in' } };
    expect(flowEdgeToGraphEdge(graphEdgeToFlowEdge(original))).toEqual(original);
  });

  test('flowEdgeToGraphEdge throws when a handle is missing', () => {
    expect(() => flowEdgeToGraphEdge({ id: 'x', source: 'a', target: 'b' })).toThrow(
      'Flow edge x is missing a sourceHandle/targetHandle (port id)',
    );
  });

  test('flowNodesToLayout extracts positions keyed by node id', () => {
    const flowNodes = graphToFlowNodes({ nodes: [numberNode('a')], edges: [] }, { a: { x: 5, y: 7 } });
    expect(flowNodesToLayout(flowNodes)).toEqual({ a: { x: 5, y: 7 } });
  });
});
