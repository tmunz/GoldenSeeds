import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CarouselSelector } from './CarouselSelector';

jest.mock('./CarouselSelector.css', () => ({}));
jest.mock('./AnimatedButton', () => ({
  DIRECTION_LEFT: 90,
  DIRECTION_RIGHT: 270,
  AnimatedButton: ({ title }: { title: string }) => <button type="button">{title}</button>,
}));

test('text options use a regular positioning viewport while retaining radio-group semantics', () => {
  const html = renderToStaticMarkup(<CarouselSelector className="carousel-compact"
    items={[{ name: 'rgb', svg: null }, { name: 'hsl', svg: null }]} selected="rgb" select={() => undefined} />);
  // Fieldsets create an anonymous content box that collapses around absolutely positioned items.
  expect(html).toContain('<div role="radiogroup"');
  expect(html).not.toContain('<fieldset');
  expect(html).toContain('class="carousel-overview"');
  expect(html).toContain('class="title">rgb</div>');
  expect(html).toContain('checked=""');
  expect(html.match(/type="radio"/g)).toHaveLength(2);
});

test('long option names retain their full tooltip and readable title', () => {
  const name = 'A long font family name';
  const html = renderToStaticMarkup(<CarouselSelector items={[{ name, svg: null }]} selected={name} select={() => undefined} />);
  expect(html).toContain(`title="${name}"`);
  expect(html).toContain(`class="title">${name}</div>`);
});

// These event tests inspect the same element handlers used by the rendered radio inputs.
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn((initial: unknown) => [typeof initial === 'function' ? initial() : initial, jest.fn()]),
  useEffect: jest.fn(),
  useRef: (initial: unknown) => ({ current: initial }),
  useId: () => 'carousel',
}));
jest.mock('../i18n/I18n', () => ({ useTranslation: () => ({ t: jest.requireActual('../i18n/translate').translate }) }));

test('clicking the selected center item activates it while neighboring items only select', () => {
  const select = jest.fn();
  const onActivate = jest.fn();
  const carousel = CarouselSelector({
    items: [{ name: 'first', svg: null }, { name: 'center', svg: null }, { name: 'last', svg: null }],
    selected: 'center', select, onActivate, selectionDelay: 0,
  });
  const items = carousel.props.children[1].props.children;
  const input = (index: number) => items[index].props.children[0];
  expect(input(1).props.checked).toBe(true);
  input(1).props.onClick();
  expect(onActivate).toHaveBeenCalledWith('center');
  expect(select).not.toHaveBeenCalled();
  onActivate.mockClear();
  input(2).props.onClick();
  input(2).props.onChange();
  expect(onActivate).not.toHaveBeenCalled();
  expect(select).toHaveBeenCalledWith('last');
});

test('Enter activates the selected item and other carousels work without an activation action', () => {
  const onActivate = jest.fn();
  const props = { items: [{ name: 'center', svg: null }], selected: 'center', select: jest.fn() };
  const carousel = CarouselSelector({ ...props, onActivate });
  const input = carousel.props.children[1].props.children[0].props.children[0];
  const preventDefault = jest.fn();
  input.props.onKeyDown({ key: 'Enter', preventDefault });
  expect(onActivate).toHaveBeenCalledWith('center');
  expect(preventDefault).toHaveBeenCalled();
  const plain = CarouselSelector(props).props.children[1].props.children[0].props.children[0];
  expect(() => plain.props.onClick()).not.toThrow();
});


test('swiping the center item does not activate it, and the next click can activate it', () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const originalMouseEvent = Object.getOwnPropertyDescriptor(globalThis, 'MouseEvent');
  const handlers: Record<string, (event: unknown) => void> = {};
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    addEventListener: (name: string, handler: (event: unknown) => void) => { handlers[name] = handler; },
    removeEventListener: jest.fn(),
  } });
  Object.defineProperty(globalThis, 'MouseEvent', { configurable: true, value: class {} });
  try {
    (React.useEffect as jest.Mock).mockClear();
    (React.useState as jest.Mock).mockImplementationOnce(() => [100, jest.fn()]);
    const onActivate = jest.fn();
    const carousel = CarouselSelector({ items: [{ name: 'center', svg: null }], selected: 'center', select: jest.fn(), onActivate });
    const viewport = carousel.props.children[1];
    const label = viewport.props.children[0];
    const input = label.props.children[0];
    const cleanup = (React.useEffect as jest.Mock).mock.calls[1][0]();
    handlers.touchmove({ touches: [{ clientX: 130 }] });
    const event = { preventDefault: jest.fn(), stopPropagation: jest.fn() };
    label.props.onClickCapture(event);
    input.props.onClick();
    expect(event.preventDefault).toHaveBeenCalled();
    expect(onActivate).not.toHaveBeenCalled();
    viewport.props.onPointerDown();
    input.props.onClick();
    expect(onActivate).toHaveBeenCalledWith('center');
    cleanup();
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
    else Reflect.deleteProperty(globalThis, 'window');
    if (originalMouseEvent) Object.defineProperty(globalThis, 'MouseEvent', originalMouseEvent);
    else Reflect.deleteProperty(globalThis, 'MouseEvent');
  }
});
