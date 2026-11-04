import { ConfigService } from './ConfigService';
import { editGraphNode } from '../graph/editor/NodeEditing';
import { RawConfig } from './RawConfig';

const raw: RawConfig = {
  meta: { name: 'Drawing' }, nodes: [{ id: 'number', kind: 'value:number', value: '1' }], edges: [],
};

test('new and imported drawings are unsaved until successfully saved', async () => {
  const service = new ConfigService();
  await service.setRawConfig(raw);
  expect(service.saveState$.value).toBe('unsaved');
  service.markSaved(service.config$.value);
  expect(service.saveState$.value).toBe('saved');
});

test('edits are dirty and undoing to the saved content restores Saved', async () => {
  const service = new ConfigService();
  await service.setRawConfig(raw, { saved: true });
  const original = service.config$.value;
  expect(service.saveState$.value).toBe('saved');
  const nodes = original.graph.nodes.map(node => node.id === 'number'
    ? editGraphNode(node, { kind: 'value', text: '2' }) : node);
  service.setGraph({ ...original.graph, nodes }, original.layout);
  expect(service.saveState$.value).toBe('unsaved');
  service.setGraph(original.graph, { ...original.layout, 'render-output': { x: 999, y: 999 } });
  expect(service.saveState$.value).toBe('saved');
});

test('renaming and moving nodes mark the drawing as unsaved', async () => {
  const service = new ConfigService();
  await service.setRawConfig(raw, { saved: true });
  service.setName('Renamed');
  expect(service.saveState$.value).toBe('unsaved');
  service.setName('Drawing');
  expect(service.saveState$.value).toBe('saved');
  service.setGraph(service.config$.value.graph, { number: { x: 100, y: 50 } });
  expect(service.saveState$.value).toBe('unsaved');
});

test('saving an earlier snapshot does not hide edits made while saving', async () => {
  const service = new ConfigService();
  await service.setRawConfig(raw);
  const snapshot = service.config$.value;
  service.setGraph(snapshot.graph, { number: { x: 20, y: 30 } });
  service.markSaved(snapshot);
  expect(service.saveState$.value).toBe('unsaved');
});

test('saving a different drawing leaves the active drawing status unchanged', async () => {
  const service = new ConfigService();
  await service.setRawConfig(raw);
  const snapshot = service.config$.value;
  await service.setRawConfig({ ...raw, meta: { name: 'Other' } });
  service.markSaved(snapshot);
  expect(service.saveState$.value).toBe('unsaved');
});

test('only drawings with unsaved content count as unsaved changes', async () => {
  const service = new ConfigService();
  expect(service.hasUnsavedChanges()).toBe(false);
  await service.setRawConfig(raw, { saved: true });
  expect(service.hasUnsavedChanges()).toBe(false);
  service.setName('Renamed');
  expect(service.hasUnsavedChanges()).toBe(true);
  await service.setRawConfig(raw);
  expect(service.hasUnsavedChanges()).toBe(true);
  service.markSaved(service.config$.value);
  expect(service.hasUnsavedChanges()).toBe(false);
  await service.setRawConfig({ meta: { name: '' }, nodes: [], edges: [] });
  expect(service.hasUnsavedChanges()).toBe(false);
});
