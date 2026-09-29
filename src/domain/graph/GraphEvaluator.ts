import { Graph } from './Graph';
import { GraphNode } from './GraphNode';
import { PortValue } from './PortValue';

export class GraphCycleError extends Error {
  nodeIds: string[];

  constructor(nodeIds: string[]) {
    super(`Cycle detected in graph involving nodes: ${nodeIds.join(', ')}`);
    this.name = 'GraphCycleError';
    this.nodeIds = nodeIds;
  }
}

export interface GraphEvaluationResult {
  order: string[];
  outputsByNode: Record<string, Record<string, PortValue>>;
}

export class GraphEvaluator {
  evaluate(graph: Graph): GraphEvaluationResult {
    const order = this.topologicalSort(graph);
    const incomingByTargetPort = this.buildIncomingIndex(graph);
    const outputsByNode: Record<string, Record<string, PortValue>> = {};

    order.forEach((nodeId) => {
      const node = this.getNode(graph, nodeId);
      const inputs: Record<string, PortValue | undefined> = {};
      node.inputs.forEach((portDef) => {
        const incoming = incomingByTargetPort.get(`${nodeId}.${portDef.id}`);
        inputs[portDef.id] = incoming ? outputsByNode[incoming.nodeId]?.[incoming.port] : undefined;
      });
      outputsByNode[nodeId] = node.evaluate(inputs);
    });

    return { order, outputsByNode };
  }

  private buildIncomingIndex(graph: Graph): Map<string, { nodeId: string; port: string }> {
    const index = new Map<string, { nodeId: string; port: string }>();
    graph.edges.forEach((edge) => {
      index.set(`${edge.to.nodeId}.${edge.to.port}`, edge.from);
    });
    return index;
  }

  private getNode(graph: Graph, nodeId: string): GraphNode {
    const node = graph.nodes.find((n) => n.id === nodeId);
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }
    return node;
  }

  private topologicalSort(graph: Graph): string[] {
    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();

    graph.nodes.forEach((node) => {
      inDegree.set(node.id, 0);
      adjacency.set(node.id, []);
    });

    graph.edges.forEach((edge) => {
      adjacency.get(edge.from.nodeId)?.push(edge.to.nodeId);
      inDegree.set(edge.to.nodeId, (inDegree.get(edge.to.nodeId) ?? 0) + 1);
    });

    const queue: string[] = [...inDegree.entries()].filter(([, degree]) => degree === 0).map(([id]) => id);
    const order: string[] = [];

    while (0 < queue.length) {
      const nodeId = queue.shift() as string;
      order.push(nodeId);
      (adjacency.get(nodeId) ?? []).forEach((neighborId) => {
        const nextDegree = (inDegree.get(neighborId) ?? 0) - 1;
        inDegree.set(neighborId, nextDegree);
        if (nextDegree === 0) {
          queue.push(neighborId);
        }
      });
    }

    if (order.length !== graph.nodes.length) {
      const remaining = graph.nodes.map((n) => n.id).filter((id) => !order.includes(id));
      throw new GraphCycleError(remaining);
    }

    return order;
  }
}

export const graphEvaluator = new GraphEvaluator();
