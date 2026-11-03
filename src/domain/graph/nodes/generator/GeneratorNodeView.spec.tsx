import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NodeProps } from '@xyflow/react';
import { GeneratorNodeView } from './GeneratorNodeView';
import { GeneratorNodeConfig } from './GeneratorNode';
import { generatorNodeRegistry } from './GeneratorNodeRegistry';
import { FlowNode, GraphNodeData } from '../../editor/GraphFlowAdapter';
import { connectionGuidance } from '../../editor/ConnectionGuidance';
import { GraphNode } from '../../model/GraphNode';

jest.mock('../../ports/GraphPortHandle.css', () => ({}));
jest.mock('../NodeView.css', () => ({}));
jest.mock('../../../../ui/AnimatedButton.css', () => ({}));
jest.mock('../../../../ui/AnimatedIcon', () => ({ AnimatedIcon: () => null }));
jest.mock('../../ports/InputPort', () => ({
  InputPort: ({ id, label }: { id: string; label: string }) => <div data-input={id}>{label}</div>,
}));
jest.mock('@xyflow/react', () => ({
  Handle: ({ id, type }: { id: string; type: string }) => <span data-handle={id} data-direction={type} />,
  Position: { Right: 'right' },
  useUpdateNodeInternals: () => jest.fn(),
  useNodeConnections: () => [],
}));

let data: GraphNodeData<GeneratorNodeConfig>;
beforeEach(async () => {
  data = { graphNode: await generatorNodeRegistry.createNode('cartesian', 'points') };
});
afterEach(() => jest.restoreAllMocks());

function nodeProps(collapsed: boolean, connected: string[] = [], selected = false, deletable = true): NodeProps<FlowNode<GeneratorNodeConfig>> {
  return {
    id: 'points', type: 'graphNode', data: { ...data, collapsed, connectedInputPorts: new Set(connected) },
    selected, dragging: false, draggable: true, selectable: true, deletable,
    isConnectable: true, positionAbsoluteX: 0, positionAbsoluteY: 0, zIndex: 0,
  };
}

function renderNode(collapsed: boolean, connected: string[] = [], selected = false, deletable = true) {
  return renderToStaticMarkup(<GeneratorNodeView {...nodeProps(collapsed, connected, selected, deletable)} />);
}

function inputIds(html: string) {
  return Array.from(html.matchAll(/data-input="([^"]+)"/g), match => match[1]);
}
function outputIds(html: string) {
  return Array.from(html.matchAll(/data-handle="([^"]+)" data-direction="source"/g), match => match[1]);
}

test('expanded generators show all inputs with grouped, readable labels', () => {
  const html = renderNode(false);
  expect(inputIds(html)).toEqual(data.graphNode.inputs.map(port => port.id));
  expect(html).toContain('>stroke width</div>');
  expect(html).toContain('aria-label="style"');
  expect(html).toContain('aria-expanded="true"');
  expect(outputIds(html)).toEqual(['points', 'svg', 'boundingBox']);
});

test('selected deletable nodes expose the delete icon and bind it to their own id', () => {
  data.onDelete = jest.fn();
  expect(renderNode(true)).not.toContain('Delete cartesian node');
  expect(renderNode(true, [], true)).toContain('aria-label="Delete cartesian node"');
  expect(renderNode(true, [], true, false)).not.toContain('Delete cartesian node');
  GeneratorNodeView(nodeProps(true, [], true)).props.onDelete();
  expect(data.onDelete).toHaveBeenCalledWith('points');
});

test('collapsed generators retain root inputs, connected parameters, and every output', () => {
  const connected = ['svg', 'param:grid.items'];
  const html = renderNode(true, connected);
  expect(inputIds(html)).toEqual(['points', 'svg', 'boundingBox', 'param:grid.items']);
  expect(outputIds(html)).toEqual(['points', 'svg', 'boundingBox']);
  expect(html).not.toContain('aria-label="style"');
  expect(html).toContain('aria-expanded="false"');
  expect(html).toContain('aria-label="Expand cartesian node"');
});

test('a collapsed generator with no connections still shows all root inputs and outputs', () => {
  const html = renderNode(true);
  expect(inputIds(html)).toEqual(['points', 'svg', 'boundingBox']);
  expect(outputIds(html)).toEqual(['points', 'svg', 'boundingBox']);
});

test('disconnecting root inputs keeps their rows while disconnected parameters collapse', () => {
  expect(inputIds(renderNode(true, ['points', 'param:grid.items']))).toEqual(['points', 'svg', 'boundingBox', 'param:grid.items']);
  expect(inputIds(renderNode(true, ['param:grid.items']))).toEqual(['points', 'svg', 'boundingBox', 'param:grid.items']);
  expect(inputIds(renderNode(true))).toEqual(['points', 'svg', 'boundingBox']);
});

test('connection drags temporarily reveal compatible hidden inputs without expanding the node', () => {
  const source: GraphNode = {
    id: 'number', kind: 'value:number', config: undefined, inputs: [],
    outputs: [{ id: 'out', type: 'number' }], evaluate: () => ({}),
  };
  data.portGuidance = connectionGuidance({ nodes: [source, data.graphNode], edges: [] },
    { nodeId: source.id, port: 'out', direction: 'source' }).points;
  const html = renderNode(true);
  const rootIds = ['points', 'svg', 'boundingBox'];
  expect(inputIds(html)).toEqual(data.graphNode.inputs
    .filter(port => rootIds.includes(port.id) || port.type === 'number').map(port => port.id));
  expect(html).toContain('aria-expanded="false"');

  // Cancelling hides temporary rows; committing retains the newly connected input.
  data.portGuidance = undefined;
  expect(inputIds(renderNode(true))).toEqual(rootIds);
  expect(inputIds(renderNode(true, ['param:grid.items']))).toEqual([...rootIds, 'param:grid.items']);
});

test('a collapsed node keeps the connection origin visible during a reverse drag', () => {
  data.portGuidance = connectionGuidance({ nodes: [data.graphNode], edges: [] },
    { nodeId: 'points', port: 'param:grid.items', direction: 'target' }).points;
  expect(inputIds(renderNode(true))).toEqual(['points', 'svg', 'boundingBox', 'param:grid.items']);
});

test('matching types that would create a cycle stay hidden', () => {
  const source: GraphNode = {
    id: 'number', kind: 'value:number', config: undefined, inputs: [{ id: 'in', type: 'points' }],
    outputs: [{ id: 'out', type: 'number' }], evaluate: () => ({}),
  };
  data.portGuidance = connectionGuidance({ nodes: [source, data.graphNode], edges: [
    { id: 'points-number', from: { nodeId: 'points', port: 'points' }, to: { nodeId: 'number', port: 'in' } },
  ] }, { nodeId: 'number', port: 'out', direction: 'source' }).points;
  expect(inputIds(renderNode(true))).toEqual(['points', 'svg', 'boundingBox']);
});

jest.mock('../../../../i18n/I18n', () => ({ useTranslation: () => ({ t: jest.requireActual('../../../../i18n/translate').translate, locale: 'en' }) }));
