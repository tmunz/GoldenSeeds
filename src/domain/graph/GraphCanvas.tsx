import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Graph } from './Graph';
import { GraphEdge } from './GraphEdge';
import { GraphNode } from './GraphNode';
import { GraphLayout, GraphPosition } from './GraphLayout';
import { graphNodeTypes } from './GraphNodeView';
import { RenderNodeView } from './RenderNodeView';
import { ValueNodeView } from './valueNode/ValueNodeView';
import { NodePalette } from './NodePalette';
import { RENDER_FLOW_NODE_TYPE, VALUE_FLOW_NODE_TYPE } from './GraphFlowAdapter';
import {
  FlowNode,
  graphNodeToFlowNode,
  graphToFlowNodes,
  graphToFlowEdges,
  flowEdgeToGraphEdge,
  flowNodesToLayout,
} from './GraphFlowAdapter';
import { isValidConnection as isValidGraphConnection } from './ConnectionValidator';
import { graphEvaluator } from './GraphEvaluator';
import { ensureRenderNode, RENDER_NODE_ID } from './RenderNode';

import './GraphCanvas.styl';

const nodeTypes = { ...graphNodeTypes, [RENDER_FLOW_NODE_TYPE]: RenderNodeView, [VALUE_FLOW_NODE_TYPE]: ValueNodeView };

export interface GraphCanvasProps {
  graph: Graph;
  layout?: GraphLayout;
  onGraphChange: (graph: Graph, layout: GraphLayout) => void;
}

/**
 * Renders a Graph (see Graph.ts) as an interactive React Flow node editor.
 *
 * - Every GraphNode becomes a custom node (see GraphNodeView) with one Handle per input/output port.
 * - Dragging a node updates its layout position; connecting/removing handles updates graph.edges.
 * - Connections are only accepted between ports with matching PortValueType (see ConnectionValidator).
 * - Any change (move, connect, disconnect) calls back with the updated Graph + GraphLayout so the
 *   caller can persist it.
 * - The graph always has a terminal, non-deletable render node (see RenderNode.ts) that shows the
 *   final SVG output; it is added automatically if the incoming `graph` doesn't already have one.
 * - The full graph is re-evaluated (see GraphEvaluator) on every change so every node's live output
 *   (including the render node's preview) stays up to date.
 */
export function GraphCanvas({ graph, layout = {}, onGraphChange }: GraphCanvasProps) {
  const [nodes, setNodes] = useState<FlowNode[]>(() => graphToFlowNodes(ensureRenderNode(graph), layout));
  const [edges, setEdges] = useState(() => graphToFlowEdges(ensureRenderNode(graph)));

  const emitChange = useCallback(
    (nextNodes: FlowNode[], nextEdgeList: GraphEdge[]) => {
      const nextGraph: Graph = { nodes: nextNodes.map((n) => n.data.graphNode), edges: nextEdgeList };
      onGraphChange(nextGraph, flowNodesToLayout(nextNodes));
    },
    [onGraphChange],
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange<FlowNode>[]) => {
      const protectedChanges = changes.filter((change) => !(change.type === 'remove' && change.id === RENDER_NODE_ID));
      setNodes((current) => {
        const next = applyNodeChanges(protectedChanges, current);
        emitChange(next, edges.map(flowEdgeToGraphEdge));
        return next;
      });
    },
    [emitChange, edges],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((current) => {
        const next = applyEdgeChanges(changes, current);
        emitChange(nodes, next.map(flowEdgeToGraphEdge));
        return next;
      });
    },
    [emitChange, nodes],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.sourceHandle || !connection.targetHandle) {
        return;
      }
      const edge: GraphEdge = {
        id: `${connection.source}.${connection.sourceHandle}->${connection.target}.${connection.targetHandle}`,
        from: { nodeId: connection.source, port: connection.sourceHandle },
        to: { nodeId: connection.target, port: connection.targetHandle },
      };
      setEdges((current) => {
        const next = [...current.filter((e) => !(e.target === edge.to.nodeId && e.targetHandle === edge.to.port)),
          { id: edge.id, source: edge.from.nodeId, sourceHandle: edge.from.port, target: edge.to.nodeId, targetHandle: edge.to.port }];
        emitChange(nodes, next.map(flowEdgeToGraphEdge));
        return next;
      });
    },
    [emitChange, nodes],
  );

  const isValidConnection = useCallback(
    (connection: Connection | { source: string | null; sourceHandle: string | null; target: string | null; targetHandle: string | null }) => {
      if (!connection.source || !connection.sourceHandle || !connection.target || !connection.targetHandle) {
        return false;
      }
      const liveGraph: Graph = { nodes: nodes.map((n) => n.data.graphNode), edges: [] };
      return isValidGraphConnection(
        liveGraph,
        { nodeId: connection.source, port: connection.sourceHandle },
        { nodeId: connection.target, port: connection.targetHandle },
      );
    },
    [nodes],
  );

  const handleAddNode = useCallback(
    (node: GraphNode, position: GraphPosition) => {
      setNodes((current) => {
        const next = [...current, graphNodeToFlowNode(node, position)];
        emitChange(next, edges.map(flowEdgeToGraphEdge));
        return next;
      });
    },
    [emitChange, edges],
  );

  const handleValueChange = useCallback(
    (nodeId: string) => {
      // A value node's own state (see ValueNodeRegistry/ValueNodeView) is mutated in place by its
      // editor, so there's no new GraphNode object to apply via applyNodeChanges - just replace the
      // node's data wrapper to force React Flow (and the outputs/persisted config below) to refresh.
      setNodes((current) => {
        const next = current.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data } } : n));
        emitChange(next, edges.map(flowEdgeToGraphEdge));
        return next;
      });
    },
    [emitChange, edges],
  );

  const evaluation = useMemo(() => {
    try {
      return graphEvaluator.evaluate({ nodes: nodes.map((n) => n.data.graphNode), edges: edges.map(flowEdgeToGraphEdge) });
    } catch {
      // e.g. a cycle created mid-edit - keep showing the last valid outputs by simply not updating them
      return null;
    }
  }, [nodes, edges]);

  const liveNodes = useMemo(
    () => nodes.map((n) => ({ ...n, data: { ...n.data, output: evaluation?.outputsByNode[n.id], onValueChange: handleValueChange } })),
    [nodes, evaluation, handleValueChange],
  );

  return (
    <div className="graph-canvas">
      <ReactFlowProvider>
        <ReactFlow
          nodes={liveNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          isValidConnection={isValidConnection}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
          <NodePalette onAdd={handleAddNode} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

