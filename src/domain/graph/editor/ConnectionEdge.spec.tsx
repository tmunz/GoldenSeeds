import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EdgeProps, Position } from '@xyflow/react';
import { ConnectionEdge } from './ConnectionEdge';

const mockDeleteElements = jest.fn(() => Promise.resolve({ deletedNodes: [], deletedEdges: [] }));
let mockDeleteHovered = false;
const mockSetDeleteHovered = jest.fn((value: boolean) => { mockDeleteHovered = value; });
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: () => [mockDeleteHovered, mockSetDeleteHovered],
  useEffect: () => undefined,
}));
jest.mock('@xyflow/react', () => ({
  BaseEdge: ({ path }: { path: string }) => <path d={path} />,
  EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Position: { Left: 'left', Right: 'right' },
  getBezierPath: () => ['M0 0 C50 0 50 100 100 100', 50, 50],
  useReactFlow: () => ({ deleteElements: mockDeleteElements }),
}));

const props: EdgeProps = {
  id: 'a-b', source: 'a', target: 'b', type: 'connection', selected: false,
  sourceX: 0, sourceY: 0, targetX: 100, targetY: 100,
  sourcePosition: Position.Right, targetPosition: Position.Left,
  selectable: true, deletable: true,
};

beforeEach(() => { mockDeleteHovered = false; mockSetDeleteHovered.mockClear(); });

test('only selected connections show the delete action', () => {
  expect(renderToStaticMarkup(<ConnectionEdge {...props} />)).not.toContain('Delete connection');
  const selected = renderToStaticMarkup(<ConnectionEdge {...props} selected />);
  expect(selected).toContain('aria-label="Delete connection"');
  expect(selected).toContain('translate(50px, 50px)');
});

test('the delete action uses the graph deletion path and stops the canvas click', () => {
  const edge = ConnectionEdge({ ...props, selected: true });
  const button = edge.props.children[1].props.children.props.children[1];
  const stopPropagation = jest.fn();
  button.props.onClick({ stopPropagation });
  expect(stopPropagation).toHaveBeenCalled();
  expect(mockDeleteElements).toHaveBeenCalledWith({ edges: [{ id: 'a-b' }] });
});

test('hovering delete colors its connection and restores the original line style on leave', () => {
  const styled = { ...props, selected: true, style: { stroke: '#abc', strokeWidth: 2 } };
  const button = ConnectionEdge(styled).props.children[1].props.children.props.children[1];
  button.props.onPointerEnter();
  expect(ConnectionEdge(styled).props.children[0].props.style).toEqual({ stroke: 'var(--errorColor)', strokeWidth: 2 });
  button.props.onPointerLeave();
  expect(ConnectionEdge(styled).props.children[0].props.style).toEqual(styled.style);
  mockDeleteHovered = true;
  expect(ConnectionEdge({ ...styled, selected: false }).props.children[0].props.style).toEqual(styled.style);
});

jest.mock('../../../i18n/I18n', () => ({ useTranslation: () => ({ t: jest.requireActual('../../../i18n/translate').translate, locale: 'en' }) }));
