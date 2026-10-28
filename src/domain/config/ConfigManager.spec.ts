import { configManager } from './ConfigManager';
import { configService } from './ConfigService';
import { preconfigs } from './data';

jest.mock('./data', () => ({ preconfigs: [{ meta: { name: 'Default drawing' }, nodes: [], edges: [] }] }));

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
const originalHistory = Object.getOwnPropertyDescriptor(globalThis, 'history');
let location: URL;
const pushState = jest.fn((_state, _title, url: string) => {
  location = new URL(url, location);
});

beforeEach(async () => {
  location = new URL('https://example.com/drawing?theme=dark#preview');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { get location() { return location; } },
  });
  Object.defineProperty(globalThis, 'history', { configurable: true, value: { pushState } });
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  await configManager.init(); // IndexedDB is unavailable here; use the bundled defaults.
  pushState.mockClear();
});

afterEach(() => {
  jest.restoreAllMocks();
  if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
  else Reflect.deleteProperty(globalThis, 'window');
  if (originalHistory) Object.defineProperty(globalThis, 'history', originalHistory);
  else Reflect.deleteProperty(globalThis, 'history');
});

test('startup loads a default drawing without adding it to the URL', async () => {
  await configManager.select(preconfigs[0].meta.name, { updateUrl: false });
  expect(configService.config$.value.meta.name).toBe('Default drawing');
  expect(location.search).toBe('?theme=dark');
  expect(pushState).not.toHaveBeenCalled();
});

test('restoring a drawing from browser history leaves its URL unchanged', async () => {
  location.search = '?id=Default+drawing';
  await configManager.select('Default drawing', { updateUrl: false });
  expect(location.search).toBe('?id=Default+drawing');
  expect(pushState).not.toHaveBeenCalled();
});

test('explicit selection sets the URL immediately without duplicate history entries', async () => {
  const loading = configManager.select('Default drawing');
  expect(location.search).toBe('?theme=dark&name=Default+drawing');
  expect(location.hash).toBe('#preview');
  await loading;
  await configManager.select('Default drawing');
  expect(pushState).toHaveBeenCalledTimes(1);
});

test('loading a drawing replaces an old identifier before conversion finishes', async () => {
  location.search = '?id=old&theme=dark';
  const loading = configManager.load({ meta: { name: 'Imported & ready' }, nodes: [], edges: [] });
  expect(location.search).toBe('?theme=dark&name=Imported+%26+ready');
  await loading;
  expect(configService.config$.value.meta.name).toBe('Imported & ready');
});

test('editing the active drawing preserves its graph, layout, and current configuration', async () => {
  await configManager.select('Default drawing', { updateUrl: false });
  const graph = { nodes: [], edges: [] };
  const layout = { custom: { x: 120, y: 80 } };
  configService.setGraph(graph, layout);
  const edited = configService.config$.value;
  await configManager.select('Default drawing', { reload: false });
  expect(configService.config$.value).toBe(edited);
  expect(configService.config$.value.graph).toBe(graph);
  expect(configService.config$.value.layout).toBe(layout);
  expect(location.search).toBe('?theme=dark&name=Default+drawing');
});

test('editing a different drawing loads its saved graph', async () => {
  await configManager.load({ meta: { name: 'Other drawing' }, nodes: [], edges: [] });
  const previous = configService.config$.value;
  await configManager.select('Default drawing', { reload: false });
  expect(configService.config$.value).not.toBe(previous);
  expect(configService.config$.value.meta.name).toBe('Default drawing');
});

test('reset replaces same-name edits with the preset before resolving', async () => {
  await configManager.load({
    meta: { name: 'Default drawing' },
    nodes: [{ id: 'edited', kind: 'value:number', value: '42' }],
    edges: [],
    layout: { edited: { x: 50, y: 60 } },
  });
  const editedGraph = configService.config$.value.graph;
  jest.spyOn(configManager, 'save').mockResolvedValue({
    name: 'Default drawing', rawConfig: preconfigs[0], preconfig: true, svg: null, sortIndex: 0,
  });
  await configManager.reset('Default drawing');
  const reset = configService.config$.value;
  expect(reset.graph).not.toBe(editedGraph);
  expect(reset.graph.nodes.some(node => node.id === 'edited')).toBe(false);
  expect(reset.layout).toEqual({});
});
