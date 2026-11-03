import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { InputPort } from './InputPort';

jest.mock('./InputPort.css', () => ({}));
jest.mock('./GraphPortHandle', () => ({ GraphPortHandle: () => <span /> }));
jest.mock('../parameters/ParameterEditor', () => ({ ParameterEditor: () => <input aria-label="Local value" /> }));

const props = {
  id: 'param:grid.items', label: 'items', type: 'number' as const,
  definition: { type: 'number' as const, initial: '1' }, onChange: () => true,
};

test('default local values use placeholder styling without an edited badge', () => {
  const html = renderToStaticMarkup(<InputPort {...props} localText="1" connected={false} />);
  expect(html).not.toContain('input-port-source');
  expect(html).toContain('input-port-default');
  expect(html).toContain('aria-label="Local value"');
});

test('local overrides keep normal styling without an edited badge', () => {
  const html = renderToStaticMarkup(<InputPort {...props} localText="5" connected={false} />);
  expect(html).not.toContain('input-port-source');
  expect(html).not.toContain('input-port-default');
  expect(html).not.toContain('input-port-value-default');
});

test('connected values show a preview and reserve the inactive editor without a text badge', () => {
  const html = renderToStaticMarkup(<InputPort {...props} localText="5" connected value={{ type: 'number', value: 20 }} />);
  expect(html).not.toContain('input-port-source');
  expect(html).not.toContain('input-port-default');
  expect(html).toContain('>20</span>');
  expect(html).toContain('class="input-port-editor input-port-hidden" aria-hidden="true" inert=""');
  expect(html).toContain('class="input-port-preview" aria-hidden="false"');
  expect(html).toContain('aria-label="Local value"');
});

test('selection defaults compare the stored option index', () => {
  const definition = { type: 'selection' as const, initial: 'second', options: ['first', 'second'] };
  expect(renderToStaticMarkup(<InputPort {...props} definition={definition} localText="1" connected={false} />))
    .toContain('input-port-default');
  expect(renderToStaticMarkup(<InputPort {...props} definition={definition} localText="0" connected={false} />))
    .not.toContain('input-port-default');
});

test('unconnected values keep the same editor and preview slots for stable row height', () => {
  const html = renderToStaticMarkup(<InputPort {...props} localText="1" connected={false} />);
  expect(html).toContain('class="input-port-editor" aria-hidden="false"');
  expect(html).toContain('class="input-port-preview input-port-hidden" aria-hidden="true"');
  expect(html).not.toContain('inert=');
});

test('connection guidance applies the incompatible state to an input row', () => {
  const html = renderToStaticMarkup(<InputPort {...props} localText="1" connected={false} guidance="incompatible" />);
  expect(html).toContain('input-incompatible');
});
