import { fromRawConfig, toRawConfig } from './GraphSerializer';
import { RENDER_NODE_ID } from './RenderNode';
import { paramPortId } from './ParamPorts';

describe('GraphSerializer', () => {
  test('fromRawConfig builds an evaluable graph, adding the terminal render node', async () => {
    const raw = {
      meta: { name: 'native' },
      nodes: [{ id: 'cartesian-1', kind: 'cartesian' }],
      edges: [],
    };

    const config = await fromRawConfig(raw);

    expect(config.meta.name).toBe('native');
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

