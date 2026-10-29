import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NodeProps } from '@xyflow/react';
import { GraphNodeView } from './GraphNodeView';
import { generatorNodeRegistry } from './GeneratorNodeRegistry';
import { FlowNode, GraphNodeData } from './GraphFlowAdapter';

let mockCollapsed = false;
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: () => [mockCollapsed, jest.fn()],
}));

jest.mock('./Node.css', () => ({}));
jest.mock('./GraphNodeView.css', () => ({}));
jest.mock('../../ui/AnimatedIcon', () => ({ AnimatedIcon: () => null }));
jest.mock('./InputPort', () => ({
  InputPort: ({ id, label }: { id: string; label: string }) => <div data-input={id}>{label}</div>,
}));
jest.mock('@xyflow/react', () => ({
  Handle: ({ id, type }: { id: string; type: string }) => <span data-handle={id} data-direction={type} />,
  Position: { Right: 'right' },
  useUpdateNodeInternals: () => jest.fn(),
}));

let data: GraphNodeData;
beforeEach(async () => {
  data = { graphNode: await generatorNodeRegistry.createNode('cartesian', 'grid') };
});
afterEach(() => jest.restoreAllMocks());

function renderNode(collapsed: boolean, connected: string[] = []) {
  mockCollapsed = collapsed;
  const props: NodeProps<FlowNode> = {
    id: 'grid', type: 'graphNode', data: { ...data, connectedInputPorts: new Set(connected) },
    selected: false, dragging: false, draggable: true, selectable: true, deletable: true,
    isConnectable: true, positionAbsoluteX: 0, positionAbsoluteY: 0, zIndex: 0,
  };
  return renderToStaticMarkup(<GraphNodeView {...props} />);
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
  expect(outputIds(html)).toEqual(['grid', 'svg', 'boundingBox']);
});

test('collapsed generators retain only connected inputs and keep every output', () => {
  const connected = ['svg', 'param:grid.items'];
  const html = renderNode(true, connected);
  expect(inputIds(html)).toEqual(connected);
  expect(outputIds(html)).toEqual(['grid', 'svg', 'boundingBox']);
  expect(html).not.toContain('aria-label="style"');
  expect(html).toContain('aria-expanded="false"');
  expect(html).toContain('aria-label="Expand cartesian node"');
});

test('a collapsed generator with no incoming connections still shows all outputs', () => {
  const html = renderNode(true);
  expect(inputIds(html)).toEqual([]);
  expect(outputIds(html)).toEqual(['grid', 'svg', 'boundingBox']);
});

test('disconnecting an input removes its row from a collapsed generator', () => {
  expect(inputIds(renderNode(true, ['grid', 'param:grid.items']))).toEqual(['grid', 'param:grid.items']);
  expect(inputIds(renderNode(true, ['param:grid.items']))).toEqual(['param:grid.items']);
});
