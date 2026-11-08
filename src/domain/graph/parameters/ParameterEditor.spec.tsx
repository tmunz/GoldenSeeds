import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ParameterEditor } from './ParameterEditor';
import { I18nProvider } from '../../../i18n/I18n';
import { ExpressionHelp } from './ExpressionHelp';

jest.mock('./ParameterEditor.css', () => ({}));
jest.mock('../../../ui/input/Input.css', () => ({}));
jest.mock('../../../ui/input/ExtendedRangeInput.css', () => ({}));
jest.mock('../../../ui/input/RangeInput.css', () => ({}));
jest.mock('../../../ui/input/TextInput.css', () => ({}));
jest.mock('../../../ui/input/TextAreaInput.css', () => ({}));
jest.mock('../../../ui/input/color/ColorInput', () => ({ ColorInput: () => null }));
jest.mock('../../animation/NumberAnimationControls', () => ({ NumberAnimationControls: () => null }));

const definition = { type: 'selection' as const, initial: 'circular', options: ['linear', 'circular'] };

test('option editors show the current text above an integer range instead of a dropdown', () => {
  const html = renderToStaticMarkup(<ParameterEditor label="type" value="1" definition={definition} onChange={() => true} />);
  expect(html).not.toContain('<select');
  expect(html).toContain('readonly="" value="1: circular"');
  expect(html).toContain('type="range" aria-label="type" aria-valuetext="1: circular"');
  expect(html).toContain('min="0" max="1" step="1"');
});

test('the selected option label stays translated without changing its numeric value', () => {
  const html = renderToStaticMarkup(<I18nProvider initialLocale="de">
    <ParameterEditor label="Typ" value="1" definition={definition} onChange={() => true} />
  </I18nProvider>);
  expect(html).toContain('readonly="" value="1: kreisförmig"');
  expect(html).toMatch(/type="range"[^>]*aria-valuetext="1: kreisförmig"[^>]*value="1"/);
});

test('number editors keep an editable number field and their numeric bounds', () => {
  const html = renderToStaticMarkup(<ParameterEditor label="count" value="5"
    definition={{ type: 'number', initial: '0', min: 0, max: 10, step: 0.5 }} onChange={() => true} />);
  expect(html).not.toContain('readonly');
  expect(html).toContain('type="text" value="5"');
  expect(html).toContain('min="0" max="10" step="0.5"');
});


test('expression fields offer a dedicated help button instead of a native tooltip', () => {
  const html = renderToStaticMarkup(<ParameterEditor label="value" value="n * 2"
    definition={{ type: 'expression', initial: '1' }} onChange={() => true} />);
  expect(html).toContain('aria-label="Expression help" aria-expanded="false"');
  expect(html).toContain('aria-haspopup="dialog"');
  expect(html).not.toContain('title="Enter a JavaScript formula');
});

test('expression help formats variables, constants, functions and an example', () => {
  const html = renderToStaticMarkup(<ExpressionHelp />);
  expect(html).toContain('<h3>Variables</h3>');
  expect(html).toContain('<dl>');
  expect(html).toContain('<pre><code>n * 360 / goldenRatio</code></pre>');
  for (const name of ['goldenRatio', 'Math.PI', 'Math.E', 'fib(n)', 'items', 'itemSize']) {
    expect(html).toContain(name);
  }
});

test('a stored formula that does not work is flagged as invalid immediately', () => {
  const render = (value: string) => renderToStaticMarkup(<ParameterEditor label="value" value={value}
    definition={{ type: 'expression', initial: '1' }} onChange={() => true} />);
  expect(render('n * 2')).not.toContain('range-invalid');
  expect(render('n *')).toContain('range-invalid');
});

test('points use a multiline value field with a coordinate example and input help', () => {
  const html = renderToStaticMarkup(<ParameterEditor label="value" value="[1,1], [2,2], [3,5.6]"
    definition={{ type: 'points', initial: '[0,0]' }} onChange={() => true} />);
  expect(html).toContain('<textarea');
  expect(html).toContain('rows="4"');
  expect(html).toContain('placeholder="[1,1], [2,2], [3,5.6]"');
  expect(html).toContain('>[1,1], [2,2], [3,5.6]</textarea>');
  expect(html).toContain('Each point needs two finite numbers');
});
