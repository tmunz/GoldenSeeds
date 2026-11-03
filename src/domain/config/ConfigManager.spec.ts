import { ConfigManager, configManager } from './ConfigManager';
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
  location.search = '?name=Default+drawing';
  await configManager.select('Default drawing', { updateUrl: false });
  expect(location.search).toBe('?name=Default+drawing');
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

test('loading a drawing replaces the previous name before conversion finishes', async () => {
  location.search = '?theme=dark&name=old';
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


test('saving reports success only after the storage transaction commits', async () => {
  const manager = new ConfigManager();
  const put = jest.fn();
  const transaction = Object.assign(new EventTarget(), { objectStore: () => ({ put }), error: null });
  const db = { transaction: () => transaction } as unknown as IDBDatabase;
  jest.spyOn(manager as unknown as { database: () => Promise<IDBDatabase> }, 'database').mockResolvedValue(db);
  let items: string[] = [];
  const subscription = manager.configItems$.subscribe(value => { items = value.map(item => item.name); });
  const saving = manager.save(preconfigs[0], 0);
  for (let tick = 0; tick < 20 && !put.mock.calls.length; tick++) { await Promise.resolve(); }
  expect(put).toHaveBeenCalled();
  expect(items).toEqual([]);
  transaction.dispatchEvent(new Event('complete'));
  await saving;
  expect(items).toEqual(['Default drawing']);
  subscription.unsubscribe();
});

test('an aborted save rejects instead of reporting a saved drawing', async () => {
  const manager = new ConfigManager();
  const put = jest.fn();
  const transaction = Object.assign(new EventTarget(), { objectStore: () => ({ put }), error: null });
  const db = { transaction: () => transaction } as unknown as IDBDatabase;
  jest.spyOn(manager as unknown as { database: () => Promise<IDBDatabase> }, 'database').mockResolvedValue(db);
  const saving = manager.save(preconfigs[0], 0);
  const failure = expect(saving).rejects.toThrow('Save aborted');
  for (let tick = 0; tick < 20 && !put.mock.calls.length; tick++) { await Promise.resolve(); }
  transaction.dispatchEvent(new Event('abort'));
  await failure;
});

test('imported names get a numeric suffix when they collide with a stored drawing', () => {
  expect(configManager.uniqueName('Fresh')).toBe('Fresh');
  expect(configManager.uniqueName('Default drawing')).toBe('Default drawing (2)');
});
