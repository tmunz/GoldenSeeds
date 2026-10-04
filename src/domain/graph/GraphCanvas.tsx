import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
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
import { PortValue } from './PortValue';
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
  graphEdgeToFlowEdge,
  flowEdgeToGraphEdge,
  flowNodesToLayout,
} from './GraphFlowAdapter';
import { isValidConnection as isValidGraphConnection } from './ConnectionValidator';
import { graphEvaluator } from './GraphEvaluator';
import { ensureRenderNode, RENDER_NODE_ID, RENDER_NODE_KIND } from './RenderNode';
import { connectResultPorts } from './StageGraphAdapter';
import { VALUE_KIND_PREFIX, DEFAULT_VALUE_DEFINITIONS } from './ValueNodeRegistry';
import { parseParamPortId, collectParamPorts } from './ParamPorts';
import { ParamDefinitionType } from '../generator/SvgGenerator';
import { Stage } from '../config/Stage';

import './GraphCanvas.styl';

const nodeTypes = { ...graphNodeTypes, [RENDER_FLOW_NODE_TYPE]: RenderNodeView, [VALUE_FLOW_NODE_TYPE]: ValueNodeView };

/** The ParamDefinition for a generator node's param (groupId/paramId), if that node is a generator node. */
function paramDefinitionFor(node: GraphNode | undefined, groupId: string, paramId: string) {
  if (!node || node.kind.startsWith(VALUE_KIND_PREFIX) || node.kind === RENDER_NODE_KIND) {
    return undefined;
  }
  return (node.config as Stage).generator.definition[groupId]?.[paramId];
}

/** A generator node's own default value (see Stage.ts) for each of its parameter ports. */
function defaultParamValues(node: GraphNode): Record<string, PortValue> | undefined {
  if (node.kind.startsWith(VALUE_KIND_PREFIX) || node.kind === RENDER_NODE_KIND) {
    return undefined;
  }
  const stage = node.config as Stage;
  const values: Record<string, PortValue> = {};
  collectParamPorts(stage.generator.definition).forEach((p) => {
    const state = stage.state.data[p.groupId]?.[p.id];
    if (state) {
      values[p.portId] = { type: p.portType, value: state.getValue() } as PortValue;
    }
  });
  return values;
}

export interface GraphCanvasProps {
  graph: Graph;
  layout?: GraphLayout;
  onGraphChange: (graph: Graph, layout: GraphLayout) => void;
  /** Called whenever the undo/redo history changes, so the caller can reflect it on its own buttons. */
  onHistoryChange?: (state: { canUndo: boolean; canRedo: boolean }) => void;
}

export interface GraphCanvasHandle {
  undo: () => void;
  redo: () => void;
}

interface GraphSnapshot {
  nodes: FlowNode[];
  edges: Edge[];
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
export const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(function GraphCanvas({ graph, layout = {}, onGraphChange, onHistoryChange }, ref) {
  const [nodes, setNodes] = useState<FlowNode[]>(() => graphToFlowNodes(ensureRenderNode(graph), layout));
  const [edges, setEdges] = useState(() => graphToFlowEdges(ensureRenderNode(graph)));

  // undo/redo history: a stack of snapshots taken right before each user-visible change (a drag's
  // start, a connect/add/remove, or the first edit of a run of value-node edits - see
  // handleValueChange). dragSnapshotRef/lastEditedValueNodeRef track the in-progress gesture so a
  // whole drag or a burst of keystrokes in the same value node collapses into a single undo step.
  const [history, setHistory] = useState<{ past: GraphSnapshot[]; future: GraphSnapshot[] }>({ past: [], future: [] });
  const dragSnapshotRef = useRef<GraphSnapshot | null>(null);
  const lastEditedValueNodeRef = useRef<string | null>(null);

  const pushHistory = useCallback((snapshot: GraphSnapshot) => {
    setHistory((h) => ({ past: [...h.past, snapshot], future: [] }));
  }, []);

  const emitChange = useCallback(
    (nextNodes: FlowNode[], nextEdgeList: GraphEdge[]) => {
      const nextGraph: Graph = { nodes: nextNodes.map((n) => n.data.graphNode), edges: nextEdgeList };
      onGraphChange(nextGraph, flowNodesToLayout(nextNodes));
    },
    [onGraphChange],
  );

  const undo = useCallback(() => {
    if (history.past.length === 0) {
      return;
    }
    const previous = history.past[history.past.length - 1];
    setHistory({ past: history.past.slice(0, -1), future: [{ nodes, edges }, ...history.future] });
    setNodes(previous.nodes);
    setEdges(previous.edges);
    emitChange(previous.nodes, previous.edges.map(flowEdgeToGraphEdge));
    lastEditedValueNodeRef.current = null;
  }, [history, nodes, edges, emitChange]);

  const redo = useCallback(() => {
    if (history.future.length === 0) {
      return;
    }
    const next = history.future[0];
    setHistory({ past: [...history.past, { nodes, edges }], future: history.future.slice(1) });
    setNodes(next.nodes);
    setEdges(next.edges);
    emitChange(next.nodes, next.edges.map(flowEdgeToGraphEdge));
    lastEditedValueNodeRef.current = null;
  }, [history, nodes, edges, emitChange]);

  useImperativeHandle(ref, () => ({ undo, redo }), [undo, redo]);

  useEffect(() => {
    onHistoryChange?.({ canUndo: history.past.length > 0, canRedo: history.future.length > 0 });
  }, [history, onHistoryChange]);

  const handleNodesChange = useCallback(
    (changes: NodeChange<FlowNode>[]) => {
      const protectedChanges = changes.filter((change) => !(change.type === 'remove' && change.id === RENDER_NODE_ID));
      // 'dimensions'/'select' changes fire on every re-measure (e.g. a node's content growing/
      // shrinking as its live value preview updates) and aren't meaningful graph changes - only
      // propagate changes that actually affect the persisted graph/layout, to avoid a feedback
      // loop (persist -> re-evaluate -> re-render -> re-measure -> persist -> ...).
      const persistable = protectedChanges.some((change) => change.type !== 'dimensions' && change.type !== 'select');
      const isPositionChange = (change: NodeChange<FlowNode>): change is Extract<NodeChange<FlowNode>, { type: 'position' }> => change.type === 'position';

      // a drag is one continuous gesture made of many intermediate position changes - remember
      // the state from right before it started, and only record it as a single undo step once
      // the drag ends (dragging: false), instead of one step per mouse-move frame.
      if (!dragSnapshotRef.current && protectedChanges.some((c) => isPositionChange(c) && c.dragging)) {
        dragSnapshotRef.current = { nodes, edges };
      }

      const next = applyNodeChanges(protectedChanges, nodes);
      setNodes(next);
      // Side effects (here: notifying the parent) must happen outside the state updater itself -
      // React may invoke updater functions more than once, which would otherwise emit duplicate/
      // nested updates and can trip React's "Maximum update depth exceeded" safeguard.
      if (persistable) {
        emitChange(next, edges.map(flowEdgeToGraphEdge));
      }

      if (protectedChanges.some((c) => isPositionChange(c) && c.dragging === false)) {
        if (dragSnapshotRef.current) {
          pushHistory(dragSnapshotRef.current);
          dragSnapshotRef.current = null;
          lastEditedValueNodeRef.current = null;
        }
      } else if (persistable && !protectedChanges.some(isPositionChange)) {
        pushHistory({ nodes, edges });
        lastEditedValueNodeRef.current = null;
      }
    },
    [emitChange, nodes, edges, pushHistory],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const persistable = changes.some((change) => change.type !== 'select');
      if (persistable) {
        pushHistory({ nodes, edges });
        lastEditedValueNodeRef.current = null;
      }
      const next = applyEdgeChanges(changes, edges);
      setEdges(next);
      if (persistable) {
        emitChange(nodes, next.map(flowEdgeToGraphEdge));
      }
    },
    [emitChange, nodes, edges, pushHistory],
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
      const next = [...edges.filter((e) => !(e.target === edge.to.nodeId && e.targetHandle === edge.to.port)),
        { id: edge.id, source: edge.from.nodeId, sourceHandle: edge.from.port, target: edge.to.nodeId, targetHandle: edge.to.port }];
      pushHistory({ nodes, edges });
      lastEditedValueNodeRef.current = null;
      setEdges(next);
      emitChange(nodes, next.map(flowEdgeToGraphEdge));
    },
    [emitChange, nodes, edges, pushHistory],
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
      pushHistory({ nodes, edges });
      lastEditedValueNodeRef.current = null;
      const nextNodes = [...nodes, graphNodeToFlowNode(node, position)];
      setNodes(nextNodes);

      // a newly added generator node becomes the new "last stage": auto-connect its result to the
      // render node's output, replacing whatever was connected there before, so the preview always
      // reflects the node that was just added without the user having to wire it up by hand.
      const isGeneratorNode = node.kind !== RENDER_NODE_KIND && !node.kind.startsWith(VALUE_KIND_PREFIX);
      const nextEdges = isGeneratorNode
        ? [...edges.filter((e) => e.target !== RENDER_NODE_ID), ...connectResultPorts(node.id, RENDER_NODE_ID).map(graphEdgeToFlowEdge)]
        : edges;
      if (isGeneratorNode) {
        setEdges(nextEdges);
      }
      emitChange(nextNodes, nextEdges.map(flowEdgeToGraphEdge));
    },
    [emitChange, nodes, edges, pushHistory],
  );

  const handleValueChange = useCallback(
    (nodeId: string) => {
      // A value node's own state (see ValueNodeRegistry/ValueNodeView) is mutated in place by its
      // editor, so there's no new GraphNode object to apply via applyNodeChanges - just replace the
      // node's data wrapper to force React Flow (and the outputs/persisted config below) to refresh.
      // A burst of edits to the same value node (e.g. every keystroke) collapses into a single undo
      // step; switching to a different node (or any other change) starts a new one.
      if (lastEditedValueNodeRef.current !== nodeId) {
        pushHistory({ nodes, edges });
        lastEditedValueNodeRef.current = nodeId;
      }
      const next = nodes.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data } } : n));
      setNodes(next);
      emitChange(next, edges.map(flowEdgeToGraphEdge));
    },
    [emitChange, nodes, edges, pushHistory],
  );

  const evaluation = useMemo(() => {
    try {
      return graphEvaluator.evaluate({ nodes: nodes.map((n) => n.data.graphNode), edges: edges.map(flowEdgeToGraphEdge) });
    } catch {
      // e.g. a cycle created mid-edit - keep showing the last valid outputs by simply not updating them
      return null;
    }
  }, [nodes, edges]);

  const inputValuesByNode = useMemo(() => {
    const map: Record<string, Record<string, PortValue>> = {};
    // start every generator node's param ports from its own default value (see Stage.ts), so
    // unconnected params still show what value is actually being used for evaluation.
    nodes.forEach((n) => {
      const defaults = defaultParamValues(n.data.graphNode);
      if (defaults) {
        map[n.id] = defaults;
      }
    });
    if (!evaluation) {
      return map;
    }
    edges.map(flowEdgeToGraphEdge).forEach((edge) => {
      const value = evaluation.outputsByNode[edge.from.nodeId]?.[edge.from.port];
      if (value) {
        (map[edge.to.nodeId] ??= {})[edge.to.port] = value;
      }
    });
    return map;
  }, [nodes, edges, evaluation]);

  const connectedInputPortsByNode = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    edges.map(flowEdgeToGraphEdge).forEach((edge) => {
      (map[edge.to.nodeId] ??= new Set()).add(edge.to.port);
    });
    return map;
  }, [edges]);

  const valueNodeDefinitions = useMemo(() => {
    const map: Record<string, ReturnType<typeof paramDefinitionFor>> = {};
    edges.map(flowEdgeToGraphEdge).forEach((edge) => {
      const param = parseParamPortId(edge.to.port);
      if (!param) {
        return;
      }
      const targetNode = nodes.find((n) => n.id === edge.to.nodeId);
      const definition = paramDefinitionFor(targetNode?.data.graphNode, param.groupId, param.id);
      if (definition) {
        map[edge.from.nodeId] = definition;
      }
    });
    return map;
  }, [nodes, edges]);

  const liveNodes = useMemo(
    () => nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        output: evaluation?.outputsByNode[n.id],
        inputValues: inputValuesByNode[n.id],
        connectedInputPorts: connectedInputPortsByNode[n.id],
        definition: valueNodeDefinitions[n.id] ?? DEFAULT_VALUE_DEFINITIONS[n.data.graphNode.kind.slice(VALUE_KIND_PREFIX.length) as ParamDefinitionType],
        onValueChange: handleValueChange,
      },
    })),
    [nodes, evaluation, inputValuesByNode, connectedInputPortsByNode, valueNodeDefinitions, handleValueChange],
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
          proOptions={{ hideAttribution: true }}
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
});

