import { fromRawConfig, toRawConfig, isLegacyRawConfig, migrateLegacyRawConfig, LegacyRawConfig } from './GraphSerializer';
import { RENDER_NODE_ID } from './RenderNode';
import { paramPortId } from './ParamPorts';

describe('GraphSerializer', () => {
  test('isLegacyRawConfig detects the old stages-based shape', () => {
    expect(isLegacyRawConfig({ meta: { name: 'a' }, stages: [] })).toBe(true);
    expect(isLegacyRawConfig({ meta: { name: 'a' }, nodes: [], edges: [] })).toBe(false);
  });

  test('migrateLegacyRawConfig turns each stage param into its own connected value node', () => {
    const legacy: LegacyRawConfig = {
      meta: { name: 'legacy' },
      stages: [
        { id: 'cartesian-1', type: 'cartesian', data: { grid: { items: '5' } } },
        { id: 'shape-1', type: 'shape', data: { style: { fillColor: 'gold' } } },
      ],
    };

    const migrated = migrateLegacyRawConfig(legacy);

    expect(migrated.nodes).toContainEqual({ id: 'cartesian-1', kind: 'cartesian' });
    expect(migrated.nodes).toContainEqual({ id: 'shape-1', kind: 'shape' });
    expect(migrated.nodes).toContainEqual(expect.objectContaining({ id: 'cartesian-1:grid.items', kind: 'value:number', value: '5' }));
    expect(migrated.nodes).toContainEqual(expect.objectContaining({ id: 'shape-1:style.fillColor', kind: 'value:color', value: 'gold' }));

    expect(migrated.edges).toContainEqual({
      id: 'cartesian-1:grid.items->cartesian-1.' + paramPortId('grid', 'items'),
      from: { nodeId: 'cartesian-1:grid.items', port: 'out' },
      to: { nodeId: 'cartesian-1', port: paramPortId('grid', 'items') },
    });

    // consecutive stages are still connected via their grid/svg/boundingBox result ports
    expect(migrated.edges).toContainEqual({
      id: 'cartesian-1.grid->shape-1.grid',
      from: { nodeId: 'cartesian-1', port: 'grid' },
      to: { nodeId: 'shape-1', port: 'grid' },
    });
  });

  test('fromRawConfig transparently migrates a legacy config and evaluates it', async () => {
    const legacy: LegacyRawConfig = {
      meta: { name: 'legacy' },
      stages: [{ id: 'cartesian-1', type: 'cartesian', data: {} }],
    };

    const config = await fromRawConfig(legacy);

    expect(config.meta.name).toBe('legacy');
    expect(config.graph.nodes.some((n) => n.id === 'cartesian-1')).toBe(true);
    expect(config.graph.nodes.some((n) => n.id === RENDER_NODE_ID)).toBe(true);
  });

  test('fromRawConfig/toRawConfig round-trip a graph-native config, preserving value node text', async () => {
    const raw = {
      meta: { name: 'native' },
      nodes: [
        { id: 'cartesian-1', kind: 'cartesian' },
        { id: 'cartesian-1:grid.items', kind: 'value:number', value: '7' },
      ],
      edges: [
        {
          id: 'edge-1',
          from: { nodeId: 'cartesian-1:grid.items', port: 'out' },
          to: { nodeId: 'cartesian-1', port: paramPortId('grid', 'items') },
        },
      ],
    };

    const config = await fromRawConfig(raw);
    const roundTripped = toRawConfig(config);

    expect(roundTripped.meta).toEqual(raw.meta);
    expect(roundTripped.nodes).toContainEqual(expect.objectContaining({ id: 'cartesian-1:grid.items', kind: 'value:number', value: '7' }));
    expect(roundTripped.nodes).toContainEqual({ id: 'cartesian-1', kind: 'cartesian', value: undefined });
    expect(roundTripped.edges).toEqual(expect.arrayContaining(raw.edges));
  });
});
