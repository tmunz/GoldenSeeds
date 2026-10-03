import type { Edge, Node } from '@xyflow/react';
import { Graph } from './Graph';
import { GraphNode } from './GraphNode';
import { GraphEdge } from './GraphEdge';
import { GraphLayout, GraphPosition, DEFAULT_POSITION } from './GraphLayout';
import { PortValue } from './PortValue';
import { ParamDefinition } from '../generator/SvgGenerator';
import { RENDER_NODE_KIND } from './RenderNode';
import { VALUE_KIND_PREFIX } from './ValueNodeRegistry';

export const GRAPH_NODE_TYPE = 'graphNode';
export const RENDER_FLOW_NODE_TYPE = 'renderNode';
export const VALUE_FLOW_NODE_TYPE = 'valueNode';

export interface GraphNodeData extends Record<string, unknown> {
  graphNode: GraphNode;
  /** The node's live evaluated outputs (see GraphEvaluator), refreshed by GraphCanvas on every change. */
  output?: Record<string, PortValue>;
  /** The current value flowing into each of the node's connected input ports, keyed by port id. */
  inputValues?: Record<string, PortValue>;
  /** Value nodes only: the ParamDefinition of whatever generator parameter the node is currently
   * connected to (falling back to a generic default - see ValueNodeRegistry - when unconnected),
   * derived by GraphCanvas instead of being persisted on the node itself. */
  definition?: ParamDefinition;
  /** Value nodes only: notifies GraphCanvas that the node's own state was mutated in place (e.g. via
   * its editor - see ValueNodeView), so it can re-evaluate the graph and persist the change. */
  onValueChange?: (nodeId: string) => void;
}


export type FlowNode = Node<GraphNodeData>;

function flowNodeType(kind: string): string {
  if (kind === RENDER_NODE_KIND) {
    return RENDER_FLOW_NODE_TYPE;
  }
  if (kind.startsWith(VALUE_KIND_PREFIX)) {
    return VALUE_FLOW_NODE_TYPE;
  }
  return GRAPH_NODE_TYPE;
}

/** Converts a single GraphNode into a React Flow node, using the given (or default) layout position. */
export function graphNodeToFlowNode(node: GraphNode, position: GraphPosition = DEFAULT_POSITION): FlowNode {
  return {
    id: node.id,
    type: flowNodeType(node.kind),
    position,
    data: { graphNode: node },
    deletable: node.kind !== RENDER_NODE_KIND,
  };
}


/** Converts every node in a Graph into React Flow nodes, positioned from the given layout (defaulting to origin). */
export function graphToFlowNodes(graph: Graph, layout: GraphLayout = {}): FlowNode[] {
  return graph.nodes.map((node) => graphNodeToFlowNode(node, layout[node.id] ?? DEFAULT_POSITION));
}

/** Converts a single GraphEdge into a React Flow edge, mapping named ports to source/target handles. */
export function graphEdgeToFlowEdge(edge: GraphEdge): Edge {
  return {
    id: edge.id,
    source: edge.from.nodeId,
    sourceHandle: edge.from.port,
    target: edge.to.nodeId,
    targetHandle: edge.to.port,
  };
}

/** Converts every edge in a Graph into React Flow edges. */
export function graphToFlowEdges(graph: Graph): Edge[] {
  return graph.edges.map(graphEdgeToFlowEdge);
}

/** Converts a React Flow edge (e.g. from onConnect) back into a GraphEdge. */
export function flowEdgeToGraphEdge(edge: Edge): GraphEdge {
  if (!edge.sourceHandle || !edge.targetHandle) {
    throw new Error(`Flow edge ${edge.id} is missing a sourceHandle/targetHandle (port id)`);
  }
  return {
    id: edge.id,
    from: { nodeId: edge.source, port: edge.sourceHandle },
    to: { nodeId: edge.target, port: edge.targetHandle },
  };
}

/** Extracts a GraphLayout (node id -> position) from React Flow nodes, e.g. after a drag, to persist alongside the Graph. */
export function flowNodesToLayout(nodes: FlowNode[]): GraphLayout {
  const layout: GraphLayout = {};
  nodes.forEach((node) => {
    layout[node.id] = { x: node.position.x, y: node.position.y };
  });
  return layout;
}
