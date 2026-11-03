import { readFileSync } from 'fs';
import { FontService, fontService } from './FontService';
import { valueNodeRegistry } from '../graph/nodes/value/ValueNodeRegistry';

const fontBuffer = new Uint8Array(readFileSync(`${__dirname}/signika-bold.otf`)).buffer;
const fontName = 'Signika-Bold';

function storage(service: FontService, record: unknown, readFails = false) {
  const get = jest.fn(() => {
    const request = Object.assign(new EventTarget(), { result: record, error: new Error('Read failed') });
    queueMicrotask(() => request.dispatchEvent(new Event(readFails ? 'error' : 'success')));
    return request;
  });
  const put = jest.fn();
  const transaction = Object.assign(new EventTarget(), { error: null, objectStore: () => ({ get, put }) });
  jest.spyOn(service as unknown as { database: () => Promise<IDBDatabase> }, 'database')
    .mockResolvedValue({ transaction: () => transaction } as unknown as IDBDatabase);
  return { get, put, transaction };
}

beforeEach(() => {
  jest.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, arrayBuffer: async () => fontBuffer } as Response);
});
afterEach(() => jest.restoreAllMocks());

test('adding a font value node with an empty default loads the bundled font', async () => {
  const db = storage(fontService, undefined);
  const node = await valueNodeRegistry.createNode('font', 'new-font', '');
  const output = node.evaluate({}).out;
  expect(output.type).toBe('font');
  if (output.type !== 'font') { throw new Error('Expected a font output'); }
  expect(output.value.names.fullName.en).toBe(fontName);
  expect(db.get).not.toHaveBeenCalled();
  expect(fetch).toHaveBeenCalledTimes(1);
});

test('loads a stored font from its binary buffer without fetching the default', async () => {
  const service = new FontService();
  storage(service, { data: fontBuffer });
  expect((await service.get(fontName)).names.fullName.en).toBe(fontName);
  expect(fetch).not.toHaveBeenCalled();
});

test.each([
  undefined, { data: undefined }, { data: 'invalid buffer' }, { data: new ArrayBuffer(4) },
])('missing or invalid stored font records fall back without throwing in the request callback: %j', async record => {
  const service = new FontService();
  storage(service, record);
  expect((await service.get('missing-font')).names.fullName.en).toBe(fontName);
  expect(fetch).toHaveBeenCalledTimes(1);
});

test('a database read error falls back to the default font', async () => {
  const service = new FontService();
  storage(service, undefined, true);
  expect((await service.get(fontName)).names.fullName.en).toBe(fontName);
});

test('unavailable storage also uses the bundled font', async () => {
  const service = new FontService();
  jest.spyOn(service as unknown as { database: () => Promise<IDBDatabase> }, 'database').mockRejectedValue(new Error('Unavailable'));
  expect((await service.get(fontName)).names.fullName.en).toBe(fontName);
});

test('failed default font requests reject instead of leaving node creation pending', async () => {
  (fetch as jest.Mock).mockResolvedValue({ ok: false } as Response);
  await expect(new FontService().get('')).rejects.toThrow('Default font could not be loaded');
});

test('font saves replace an existing record and finish only when the transaction commits', async () => {
  const service = new FontService();
  const { put, transaction } = storage(service, undefined);
  const saved = jest.fn();
  const saving = service.saveBuffer(fontBuffer).then(saved);
  await Promise.resolve();
  expect(put).toHaveBeenCalledWith({ fontName, data: fontBuffer });
  expect(saved).not.toHaveBeenCalled();
  transaction.dispatchEvent(new Event('complete'));
  await saving;
  expect(saved).toHaveBeenCalledWith(expect.objectContaining({ fontName }));
});

test('font save failures reject', async () => {
  const service = new FontService();
  const { transaction } = storage(service, undefined);
  const saving = service.saveBuffer(fontBuffer);
  const rejected = expect(saving).rejects.toThrow('Font save aborted');
  await Promise.resolve();
  transaction.dispatchEvent(new Event('abort'));
  await rejected;
});
