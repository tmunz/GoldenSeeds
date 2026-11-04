import React, { forwardRef, useCallback, useDeferredValue, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '../../../i18n/I18n';
import {
  ReactFlow,
  Background,
  MiniMap,
  Panel,
  Connection,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  ReactFlowProvider,
  useStore,
  useReactFlow,
  useConnection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { GraphAnimationContext, GraphAnimationControls } from '../../animation/useGraphAnimation';
import { applyNumberAnimations } from '../../animation/GraphAnimation';
import { editGraphNode, NodeEdit } from './NodeEditing';
import { parameterPortValue, valueEditorDefinition } from '../parameters/ParameterValues';
import { DISTRIBUTION_DEFINITION, ProbabilityDistribution } from '../../../datatypes/ProbabilityDistribution';
import { Graph } from '../model/Graph';
import { GraphEdge } from '../model/GraphEdge';
import { GraphNode } from '../model/GraphNode';
import { GraphLayout, GraphPosition, DEFAULT_VIEWPORT, NODE_GRID_SIZE } from '../model/GraphLayout';
import { PortValue } from '../model/PortValue';
import { GeneratorNodeView } from '../nodes/generator/GeneratorNodeView';
import { RenderNodeView } from '../nodes/render/RenderNodeView';
import { ValueNodeView } from '../nodes/value/ValueNodeView';
import { NodePalette } from './NodePalette';
import { GraphControls, fitNodes } from './GraphControls';
import { collectFragment, getClipboard, GraphFragment, instantiateFragment, setClipboard } from './GraphClipboard';
import { ConnectionEdge } from './ConnectionEdge';
import { GRAPH_NODE_TYPE, RENDER_FLOW_NODE_TYPE, VALUE_FLOW_NODE_TYPE } from './GraphFlowAdapter';
import {
  FlowNode,
  graphNodeToFlowNode,
  graphToFlowNodes,
  graphToFlowEdges,
  graphEdgeToFlowEdge,
  flowEdgeToGraphEdge,
  flowNodesToLayout,
} from './GraphFlowAdapter';
import { connectionGuidance } from './ConnectionGuidance';
import { isValidConnection as isValidGraphConnection } from '../runtime/ConnectionValidator';
import { graphEvaluator } from '../runtime/GraphEvaluator';
import { ensureRenderNode, RENDER_NODE_ID, RENDER_NODE_KIND, renderNodeResult } from '../nodes/render/RenderNode';
import { connectionsForAddedNode } from './NodeInsertion';
import { VALUE_KIND_PREFIX } from '../nodes/value/ValueNodeRegistry';
import { parseParamPortId, collectParamPorts } from '../parameters/ParamPorts';
import { GeneratorNodeConfig } from '../nodes/generator/GeneratorNode';
import { svgService } from '../../svg/SvgService';

import './GraphCanvas.css';

const nodeTypes = { [GRAPH_NODE_TYPE]: GeneratorNodeView, [RENDER_FLOW_NODE_TYPE]: RenderNodeView, [VALUE_FLOW_NODE_TYPE]: ValueNodeView };
const edgeTypes = { connection: ConnectionEdge };
const defaultEdgeOptions = { type: 'connection' };
const MINI_VIEW_SIZE = { width: 200, height: 150 };
const NODE_SNAP_GRID: [number, number] = [NODE_GRID_SIZE, NODE_GRID_SIZE];
const BACKGROUND_DOT_SIZE = 1;
// React Flow centers the pattern tile; offset it so dot centers land on snap coordinates.
const BACKGROUND_DOT_OFFSET = (BACKGROUND_DOT_SIZE - NODE_GRID_SIZE) / 2;

/** Editor metadata for a generator parameter or a structured value's numeric field. */
function paramDefinitionFor(node: GraphNode | undefined, portId: string) {
  if (!node || node.kind === RENDER_NODE_KIND) { return undefined; }
  if (node.kind === `${VALUE_KIND_PREFIX}distribution`) {
    return DISTRIBUTION_DEFINITION[portId as keyof ProbabilityDistribution];
  }
  if (node.kind.startsWith(VALUE_KIND_PREFIX)) { return undefined; }
  const param = parseParamPortId(portId);
  return param ? (node.config as GeneratorNodeConfig).generator.definition[param.groupId]?.[param.id] : undefined;
}

/** A generator node's own default value (see GeneratorNode.ts) for each of its parameter ports. */
function defaultParamValues(node: GraphNode): Record<string, PortValue> | undefined {
  if (node.kind.startsWith(VALUE_KIND_PREFIX) || node.kind === RENDER_NODE_KIND) {
    return undefined;
  }
  const config = node.config as GeneratorNodeConfig;
  const values: Record<string, PortValue> = {};
  collectParamPorts(config.generator.definition).forEach((p) => {
    const state = config.parameters[p.groupId]?.[p.id];
    if (state) {
      const definition = config.generator.definition[p.groupId][p.id];
      values[p.portId] = parameterPortValue(definition, state);
    }
  });
  return values;
}

export interface GraphCanvasProps {
  graph: Graph;
  showResultPreview?: boolean;
  animation?: GraphAnimationControls;
  layout?: GraphLayout;
  onGraphChange: (graph: Graph, layout: GraphLayout) => void;
  onHistoryChange?: (state: { canUndo: boolean; canRedo: boolean }) => void;
}

export interface GraphCanvasHandle {
  undo: () => void;
  redo: () => void;
  /** Copy the selected nodes (and the value nodes only feeding them) to the editor clipboard. */
  copy: () => void;
  paste: () => void;
  /** Insert a copy of the selected nodes right next to them without touching the clipboard. */
  duplicate: () => void;
  fit: () => void;
}

const PASTE_OFFSET = NODE_GRID_SIZE * 2;

interface GraphSnapshot {
  nodes: FlowNode[];
  edges: Edge[];
}

const GraphCanvasContent = forwardRef<GraphCanvasHandle, GraphCanvasProps>(function GraphCanvasContent({ graph, animation, layout = {}, showResultPreview = true, onGraphChange, onHistoryChange }, ref) {
  const { t } = useTranslation();
  const { fitView, getNodes, getViewport, setViewport } = useReactFlow();
  const connectionStart = useConnection(state => state.fromHandle);
  const pendingFocusRef = useRef<string | null>(null);
  const [viewportX, viewportY, zoom] = useStore((state) => state.transform);
  const width = useStore((state) => state.width);
  const height = useStore((state) => state.height);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const previousWidthRef = useRef(width);

  useLayoutEffect(() => {
    const previousWidth = previousWidthRef.current;
    previousWidthRef.current = width;
    if (width <= 0 || previousWidth === width) { return; }
    // Keep graph content the same distance from the right edge as the editor resizes.
    // Viewport translation uses screen pixels, so this also works at every zoom level.
    const viewport = getViewport();
    void setViewport({ ...viewport, x: viewport.x + width - previousWidth }, { duration: 0 });
  }, [width, getViewport, setViewport]);

  const [nodes, setNodes] = useState<FlowNode[]>(() => graphToFlowNodes(ensureRenderNode(graph), layout));
  const [edges, setEdges] = useState(() => graphToFlowEdges(ensureRenderNode(graph)));
  const [collapsedByNode, setCollapsedByNode] = useState<Record<string, boolean>>({});
  const liveGraph = useMemo<Graph>(() => ({
    nodes: nodes.map(node => node.data.graphNode),
    edges: edges.map(flowEdgeToGraphEdge),
  }), [nodes, edges]);

  useEffect(() => {
    const target = nodes.find(node => node.id === pendingFocusRef.current);
    if (!target?.measured?.width || !target.measured.height) { return; }
    pendingFocusRef.current = null;
    void fitView({ nodes: [{ id: target.id }], duration: 300, padding: 0.2, minZoom: 0.1, maxZoom: 0.8 });
  }, [nodes, fitView]);

  const [history, setHistory] = useState<{ past: GraphSnapshot[]; future: GraphSnapshot[] }>({ past: [], future: [] });
  const dragSnapshotRef = useRef<GraphSnapshot | null>(null);
  const lastEditedValueNodeRef = useRef<string | null>(null);
  const sourceGraphRef = useRef(graph);
  const emittedGraphsRef = useRef(new WeakSet<Graph>());

  useEffect(() => {
    // Local edits return through the parent unchanged. A different graph means a
    // reset, reload, import, or drawing switch, even when its name stays the same.
    if (graph === sourceGraphRef.current) { return; }
    sourceGraphRef.current = graph;
    // Parent updates can acknowledge an earlier drag frame after a newer one was emitted.
    if (emittedGraphsRef.current.has(graph)) { return; }
    pendingFocusRef.current = null;
    const nextGraph = ensureRenderNode(graph);
    setNodes(graphToFlowNodes(nextGraph, layout));
    setCollapsedByNode({});
    setEdges(graphToFlowEdges(nextGraph));
    void setViewport({ ...DEFAULT_VIEWPORT, x: width });
    setHistory({ past: [], future: [] });
    dragSnapshotRef.current = null;
    lastEditedValueNodeRef.current = null;
  }, [graph, layout, width, setViewport]);

  const pushHistory = useCallback((snapshot: GraphSnapshot) => {
    setHistory((h) => ({ past: [...h.past, snapshot], future: [] }));
  }, []);

  const emitChange = useCallback(
    (nextNodes: FlowNode[], nextEdgeList: GraphEdge[]) => {
      const nextGraph: Graph = { nodes: nextNodes.map((n) => n.data.graphNode), edges: nextEdgeList };
      sourceGraphRef.current = nextGraph;
      emittedGraphsRef.current.add(nextGraph);
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

  const latestRef = useRef({ nodes, edges, liveGraph });
  latestRef.current = { nodes, edges, liveGraph };
  const pasteCountRef = useRef(0);

  const insertFragment = useCallback(async (fragment: GraphFragment, step: number) => {
    const created = await instantiateFragment(
      fragment, new Set(latestRef.current.nodes.map((node) => node.id)), { x: PASTE_OFFSET * step, y: PASTE_OFFSET * step },
    );
    // Loading parameter state is asynchronous, so build on whatever the graph looks like by now.
    const { nodes: currentNodes, edges: currentEdges } = latestRef.current;
    const added = created.nodes.map((node) => ({ ...graphNodeToFlowNode(node, created.layout[node.id]), selected: true }));
    const nextNodes = [...currentNodes.map((entry) => ({ ...entry, selected: false })), ...added];
    const nextEdges = [...currentEdges, ...created.edges.map(graphEdgeToFlowEdge)];
    pushHistory({ nodes: currentNodes, edges: currentEdges });
    lastEditedValueNodeRef.current = null;
    setNodes(nextNodes);
    setEdges(nextEdges);
    emitChange(nextNodes, nextEdges.map(flowEdgeToGraphEdge));
  }, [emitChange, pushHistory]);

  const selectedFragment = useCallback(() => {
    const { nodes: currentNodes, liveGraph: currentGraph } = latestRef.current;
    return collectFragment(currentGraph, flowNodesToLayout(currentNodes),
      currentNodes.filter((node) => node.selected).map((node) => node.id));
  }, []);

  const copy = useCallback(() => {
    const fragment = selectedFragment();
    if (fragment) {
      setClipboard(fragment);
      pasteCountRef.current = 0;
    }
  }, [selectedFragment]);

  const paste = useCallback(() => {
    const fragment = getClipboard();
    if (fragment) { void insertFragment(fragment, ++pasteCountRef.current); }
  }, [insertFragment]);

  const duplicate = useCallback(() => {
    const fragment = selectedFragment();
    if (fragment) { void insertFragment(fragment, 1); }
  }, [selectedFragment, insertFragment]);

  const fit = useCallback(() => fitNodes(fitView, getNodes()), [fitView, getNodes]);

  useImperativeHandle(ref, () => ({ undo, redo, copy, paste, duplicate, fit }), [undo, redo, copy, paste, duplicate, fit]);

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
      if (!persistable) {
        // Initial measurements arrive in separate callbacks before React renders again.
        // Merge each batch into the latest state, or the last batch hides earlier nodes
        // by replacing their measured dimensions with the stale, unmeasured snapshot.
        setNodes((current) => applyNodeChanges(protectedChanges, current));
        return;
      }
      const isPositionChange = (change: NodeChange<FlowNode>): change is Extract<NodeChange<FlowNode>, { type: 'position' }> => change.type === 'position';

      // a drag is one continuous gesture made of many intermediate position changes - remember
      // the state from right before it started, and only record it as a single undo step once
      // the drag ends (dragging: false), instead of one step per mouse-move frame.
      if (!dragSnapshotRef.current && protectedChanges.some((c) => isPositionChange(c) && c.dragging)) {
        dragSnapshotRef.current = { nodes, edges };
      }

      const next = applyNodeChanges(protectedChanges, nodes);
      const nodeIds = new Set(next.map((node) => node.id));
      // React Flow sends edge and node removals separately in the same event. The captured
      // edges may still include the removed node, so remove its connections before persisting.
      const nextEdges = edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
      setNodes(next);
      if (nextEdges.length !== edges.length) {
        setEdges(nextEdges);
      }
      // Side effects (here: notifying the parent) must happen outside the state updater itself -
      // React may invoke updater functions more than once, which would otherwise emit duplicate/
      // nested updates and can trip React's "Maximum update depth exceeded" safeguard.
      emitChange(next, nextEdges.map(flowEdgeToGraphEdge));

      if (protectedChanges.some((c) => isPositionChange(c) && c.dragging === false)) {
        if (dragSnapshotRef.current) {
          pushHistory(dragSnapshotRef.current);
          dragSnapshotRef.current = null;
          lastEditedValueNodeRef.current = null;
        }
      } else if (!protectedChanges.some(isPositionChange)) {
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
        graphEdgeToFlowEdge(edge)];
      pushHistory({ nodes, edges });
      lastEditedValueNodeRef.current = null;
      setEdges(next);
      emitChange(nodes, next.map(flowEdgeToGraphEdge));
    },
    [emitChange, nodes, edges, pushHistory],
  );

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      if (!connection.source || !connection.sourceHandle || !connection.target || !connection.targetHandle) {
        return false;
      }
      return isValidGraphConnection(
        liveGraph,
        { nodeId: connection.source, port: connection.sourceHandle },
        { nodeId: connection.target, port: connection.targetHandle },
      );
    },
    [liveGraph],
  );

  const handleAddNode = useCallback(
    (node: GraphNode, position: GraphPosition) => {
      pushHistory({ nodes, edges });
      lastEditedValueNodeRef.current = null;
      pendingFocusRef.current = node.id;
      const nextNodes = [...nodes.map(entry => ({ ...entry, selected: false })), { ...graphNodeToFlowNode(node, position), selected: true }];
      setNodes(nextNodes);

      const addedEdges = connectionsForAddedNode(node, edges.length > 0).map(graphEdgeToFlowEdge);
      const nextEdges = addedEdges.length ? [...edges, ...addedEdges] : edges;
      if (addedEdges.length) {
        setEdges(nextEdges);
      }
      emitChange(nextNodes, nextEdges.map(flowEdgeToGraphEdge));
    },
    [emitChange, nodes, edges, pushHistory],
  );

  const handleNodeEdit = useCallback((nodeId: string, edit: NodeEdit) => {
    const node = nodes.find((entry) => entry.id === nodeId);
    if (!node || (edit.kind === 'parameter' && edges.some((edge) => edge.target === nodeId && edge.targetHandle === edit.portId))) {
      return false;
    }
    const graphNode = editGraphNode(node.data.graphNode, edit);
    if (graphNode === node.data.graphNode) { return false; }
    const editId = `${nodeId}.${edit.kind === 'parameter' ? edit.portId : 'value'}`;
    if (lastEditedValueNodeRef.current !== editId) {
      pushHistory({ nodes, edges });
      lastEditedValueNodeRef.current = editId;
    }
    const next = nodes.map((entry) => entry.id === nodeId ? { ...entry, data: { ...entry.data, graphNode } } : entry);
    setNodes(next);
    emitChange(next, edges.map(flowEdgeToGraphEdge));
    return true;
  }, [nodes, edges, pushHistory, emitChange]);

  // Heavy generators must not block typing or dragging sliders, so evaluation trails behind edits.
  // Animation frames are urgent updates themselves; deferring those would freeze the preview until playback ends.
  const deferredGraph = useDeferredValue(liveGraph);
  const evaluatedGraph = animation?.frames.length ? liveGraph : deferredGraph;
  const evaluation = useMemo(() => {
    try {
      return graphEvaluator.evaluate(applyNumberAnimations(evaluatedGraph, animation?.frames ?? []));
    } catch {
      // e.g. a cycle created mid-edit - keep showing the last valid outputs by simply not updating them
      return null;
    }
  }, [evaluatedGraph, animation?.frames]);

  const resultPreview = useMemo(() => {
    if (!showResultPreview) { return ''; }
    return svgService.wrapResult(renderNodeResult(evaluation?.outputsByNode), MINI_VIEW_SIZE.width, MINI_VIEW_SIZE.height, 16);
  }, [evaluation, showResultPreview]);

  const inputValuesByNode = useMemo(() => {
    const map: Record<string, Record<string, PortValue>> = {};
    // start every generator node's param ports from its own default value (see GeneratorNode.ts), so
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
    liveGraph.edges.forEach((edge) => {
      const value = evaluation.outputsByNode[edge.from.nodeId]?.[edge.from.port];
      if (value) {
        (map[edge.to.nodeId] ??= {})[edge.to.port] = value;
      }
    });
    return map;
  }, [nodes, liveGraph, evaluation]);

  const connectedInputPortsByNode = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    liveGraph.edges.forEach((edge) => {
      (map[edge.to.nodeId] ??= new Set()).add(edge.to.port);
    });
    return map;
  }, [liveGraph]);

  const valueNodeDefinitions = useMemo(() => {
    const map: Record<string, ReturnType<typeof paramDefinitionFor>> = {};
    liveGraph.edges.forEach((edge) => {
      const targetNode = nodes.find((n) => n.id === edge.to.nodeId);
      const definition = paramDefinitionFor(targetNode?.data.graphNode, edge.to.port);
      if (definition) { map[edge.from.nodeId] = valueEditorDefinition(definition); }
    });
    return map;
  }, [nodes, liveGraph]);

  const portGuidanceByNode = useMemo(() => connectionGuidance(
    liveGraph,
    connectionStart?.id ? { nodeId: connectionStart.nodeId, port: connectionStart.id, direction: connectionStart.type } : null,
  ), [liveGraph, connectionStart]);

  const handleCollapseChange = useCallback((nodeId: string, collapsed: boolean) => {
    setCollapsedByNode(current => ({ ...current, [nodeId]: collapsed }));
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    const node = nodes.find(entry => entry.id === nodeId);
    if (!node || node.deletable === false || nodeId === RENDER_NODE_ID) { return; }
    const nextNodes = nodes.filter(entry => entry.id !== nodeId);
    const nextEdges = edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId);
    // Removing a node and its connections is one undoable action.
    pushHistory({ nodes, edges });
    lastEditedValueNodeRef.current = null;
    if (pendingFocusRef.current === nodeId) { pendingFocusRef.current = null; }
    setNodes(nextNodes);
    setEdges(nextEdges);
    emitChange(nextNodes, nextEdges.map(flowEdgeToGraphEdge));
  }, [nodes, edges, pushHistory, emitChange]);

  const liveNodes = useMemo(
    () => nodes.map((n) => ({
      ...n,
      ...(n.id === RENDER_NODE_ID ? {
        position: { x: (width - 2 - viewportX) / zoom, y: (height / 2 - 33 - viewportY) / zoom },
        style: { width: 2 / zoom, height: 66 / zoom },
        draggable: false,
        selectable: false,
        focusable: false,
        zIndex: 1000,
      } : {}),
      data: {
        ...n.data,
        collapsed: collapsedByNode[n.id] ?? n.data.collapsed,
        inputValues: inputValuesByNode[n.id],
        connectedInputPorts: connectedInputPortsByNode[n.id],
        definition: valueNodeDefinitions[n.id],
        onEdit: handleNodeEdit,
        onCollapseChange: handleCollapseChange,
        onDelete: handleDeleteNode,
        portGuidance: portGuidanceByNode[n.id],
      },
    })),
    [nodes, collapsedByNode, portGuidanceByNode, inputValuesByNode, connectedInputPortsByNode, valueNodeDefinitions, handleNodeEdit, handleCollapseChange, handleDeleteNode, width, height, viewportX, viewportY, zoom],
  );

  return (
    <div className="graph-canvas">
      <GraphAnimationContext.Provider value={animation}>
        <ReactFlow
          nodes={liveNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          isValidConnection={isValidConnection}
          deleteKeyCode={['Backspace', 'Delete']}
          proOptions={{ hideAttribution: true }}
          ariaLabelConfig={{
            'node.a11yDescription.default': t('graph.nodeInstructions'),
            'node.a11yDescription.keyboardDisabled': t('graph.nodeKeyboardDisabled'),
            'node.a11yDescription.ariaLiveMessage': ({ direction, x, y }) => t('graph.nodeMoved', {
              direction: t(`graph.direction.${direction}`, {}, direction), x, y,
            }),
            'edge.a11yDescription.default': t('graph.edgeInstructions'),
            'controls.ariaLabel': t('graph.navigation'),
            'controls.zoomIn.ariaLabel': t('graph.zoomIn'),
            'controls.zoomOut.ariaLabel': t('graph.zoomOut'),
            'controls.fitView.ariaLabel': t('graph.fit'),
            'controls.interactive.ariaLabel': t('graph.interactivity'),
            'minimap.ariaLabel': t('graph.minimap'),
            'handle.ariaLabel': t('graph.handle'),
          }}
          defaultViewport={DEFAULT_VIEWPORT}
          minZoom={0.1}
          autoPanOnConnect={false}
          snapToGrid={snapToGrid}
          snapGrid={NODE_SNAP_GRID}
        >
          <Background gap={NODE_SNAP_GRID} size={BACKGROUND_DOT_SIZE} offset={BACKGROUND_DOT_OFFSET} />
          <GraphControls snapToGrid={snapToGrid} onToggleSnap={() => setSnapToGrid(value => !value)} />
          <MiniMap style={MINI_VIEW_SIZE} />
          {showResultPreview && <Panel position="top-right" className="graph-result-preview" style={MINI_VIEW_SIZE}>
            <img
              alt={t('graph.preview')}
              draggable={false}
              src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(resultPreview)}`}
            />
          </Panel>}
          <NodePalette onAdd={handleAddNode} />
        </ReactFlow>
      </GraphAnimationContext.Provider>
    </div>
  );
});


export const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(function GraphCanvas(props, ref) {
  return <ReactFlowProvider><GraphCanvasContent {...props} ref={ref} /></ReactFlowProvider>;
});
