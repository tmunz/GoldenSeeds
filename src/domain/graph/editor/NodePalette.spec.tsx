import React from 'react';
import { NodePalette } from './NodePalette';

const mockSetState = jest.fn();
const mockFitView = jest.fn((options: { nodes: { id: string }[] }) => Promise.resolve(options.nodes.length > 0));
let mockNodes: { id: string; selected: boolean; position: { x: number; y: number }; measured?: { width: number; height: number } }[] = [];
const mockViewport = { x: -100, y: -50, zoom: 0.5 };

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: (initial: unknown) => [initial, mockSetState],
  useRef: (initial: unknown) => ({ current: initial }),
  useEffect: jest.fn(),
}));
jest.mock('./NodePalette.css', () => ({}));
jest.mock('@xyflow/react', () => ({
  Panel: 'section',
  useReactFlow: () => ({ getViewport: () => mockViewport, getNodes: () => mockNodes, fitView: mockFitView }),
  useStore: (selector: (state: unknown) => unknown) => selector({ width: 800, height: 600, nodes: mockNodes }),
}));
jest.mock('../nodes/generator/GeneratorNodeRegistry', () => ({ generatorNodeRegistry: {
  kinds: ['shape'],
  createNode: async () => ({ id: 'new', kind: 'shape', config: { generator: { definition: {} } } }),
} }));
jest.mock('../nodes/value/ValueNodeRegistry', () => ({
  DEFAULT_VALUE_DEFINITIONS: { number: { initial: '0' } },
  valueNodeRegistry: { createNode: async () => ({ id: 'number', kind: 'value:number', config: {} }) },
}));

beforeEach(() => { mockNodes = []; mockFitView.mockClear(); mockSetState.mockClear(); });

test('new nodes use the graph canvas viewport, including its pan and zoom', async () => {
  const onAdd = jest.fn();
  const panel = NodePalette({ onAdd });
  await findButton(panel, 'shape').props.onClick();
  expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ id: 'new' }), { x: 810, y: 500 });
});

test('new nodes avoid occupied positions near the visible viewport', async () => {
  mockNodes = [{ id: 'existing', selected: false, position: { x: 790, y: 500 }, measured: { width: 420, height: 800 } }];
  const onAdd = jest.fn();
  const panel = NodePalette({ onAdd });
  await findButton(panel, 'shape').props.onClick();
  const position = onAdd.mock.calls[0][1];
  expect(position.x + 380 + 40 <= 790 || position.x >= 1250 || position.y + 400 + 40 <= 500 || position.y >= 1340).toBe(true);
});


function findButton(element: React.ReactElement, label: string): React.ReactElement {
  if (element.type === 'button' && (element.props.children === label || element.props['aria-label'] === label)) { return element; }
  for (const child of React.Children.toArray(element.props.children)) {
    if (!React.isValidElement(child)) { continue; }
    const found = findButton(child, label);
    if (found) { return found; }
  }
  return undefined as unknown as React.ReactElement;
}

test('offers generator and value nodes directly beside a collapsed plus control', async () => {
  const onAdd = jest.fn();
  const panel = NodePalette({ onAdd });
  expect(findButton(panel, 'Add node').props['aria-expanded']).toBe(false);
  expect(findButton(panel, 'shape')).toBeDefined();
  for (const kind of ['number', 'expression', 'distribution', 'color', 'string', 'font']) {
    expect(findButton(panel, kind)).toBeDefined();
  }
  await findButton(panel, 'number').props.onClick();
  expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ kind: 'value:number' }), expect.any(Object));
});

test('hover opens the list and tap pins it until tapped again', () => {
  const panel = NodePalette({ onAdd: jest.fn() });
  const control = panel.props.children;
  const toggle = findButton(panel, 'Add node');
  control.props.onPointerEnter({ pointerType: 'touch' });
  expect(mockSetState).not.toHaveBeenCalled();
  control.props.onPointerEnter({ pointerType: 'mouse' });
  expect(mockSetState).toHaveBeenLastCalledWith(true);
  control.props.onPointerLeave({ pointerType: 'mouse' });
  expect(mockSetState).toHaveBeenLastCalledWith(false);
  toggle.props.onClick();
  expect(mockSetState).toHaveBeenLastCalledWith(true);
  mockSetState.mockClear();
  control.props.onPointerLeave({ pointerType: 'mouse' });
  expect(mockSetState).not.toHaveBeenCalled();
  toggle.props.onClick();
  expect(mockSetState).toHaveBeenLastCalledWith(false);
});

jest.mock('../../../i18n/I18n', () => ({ useTranslation: () => ({ t: jest.requireActual('../../../i18n/translate').translate, locale: 'en' }) }));
