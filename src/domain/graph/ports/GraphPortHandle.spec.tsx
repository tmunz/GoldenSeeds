import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GraphPortHandle } from './GraphPortHandle';

let mockConnectionCount = 0;
const mockConnections = jest.fn<unknown[], [unknown]>(() => Array.from({ length: mockConnectionCount }));

jest.mock('./GraphPortHandle.css', () => ({}));
jest.mock('@xyflow/react', () => ({
  Position: { Left: 'left', Right: 'right' },
  useNodeConnections: (options: unknown) => mockConnections(options),
  Handle: ({ className, title, 'aria-label': label }: { className: string; title: string; 'aria-label': string }) =>
    <span className={className} title={title} aria-label={label} />,
}));

beforeEach(() => {
  mockConnectionCount = 0;
  mockConnections.mockClear();
});

test.each(['source', 'target'] as const)('%s markers follow the connections on their own handle', direction => {
  const render = () => renderToStaticMarkup(<GraphPortHandle id="value" direction={direction} portType="number" />);
  expect(render()).toContain('port-unconnected');
  expect(mockConnections).toHaveBeenLastCalledWith({ handleType: direction, handleId: 'value' });

  mockConnectionCount = 1;
  const connected = render();
  expect(connected).toContain('port-connected');
  expect(connected).not.toContain('port-unconnected');
  expect(connected).toContain(`aria-label="number ${direction === 'source' ? 'output' : 'input'}, connected"`);

  // Outputs stay full while any of their outgoing edges remain.
  mockConnectionCount = 2;
  expect(render()).toContain('port-connected');
  mockConnectionCount = 0;
  expect(render()).toContain('port-unconnected');
});
