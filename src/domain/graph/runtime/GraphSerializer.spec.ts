import { fromRawConfig, toRawConfig } from './GraphSerializer';
import { RENDER_NODE_ID } from '../nodes/render/RenderNode';
import { paramPortId } from '../parameters/ParamPorts';
import { graphEvaluator } from './GraphEvaluator';

describe('GraphSerializer', () => {
  test('loads current points connections and generator parameters without rewriting them', async () => {
    const raw = {
      meta: { name: 'points' },
      nodes: [{ id: 'source', kind: 'cartesian', parameters: { grid: { items: '4', x: '2' } } }],
      edges: [{ id: 'points-edge', from: { nodeId: 'source', port: 'points' }, to: { nodeId: RENDER_NODE_ID, port: 'points' } }],
    };
    const config = await fromRawConfig(raw);
    const output = graphEvaluator.evaluate(config.graph).outputsByNode.source.points;
    expect(output.type === 'points' && output.value.length).toBe(4);
    expect(config.graph.edges).toEqual(raw.edges);
    expect(toRawConfig(config).edges).toEqual(raw.edges);
  });

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
        { id: 'cartesian-1:points.items', kind: 'value:number', value: '7' },
      ],
      edges: [
        {
          id: 'edge-1',
          from: { nodeId: 'cartesian-1:points.items', port: 'out' },
          to: { nodeId: 'cartesian-1', port: paramPortId('grid', 'items') },
        },
      ],
    };

    const config = await fromRawConfig(raw);
    const roundTripped = toRawConfig(config);

    expect(roundTripped.meta).toEqual(raw.meta);
    expect(roundTripped.nodes).toContainEqual(expect.objectContaining({ id: 'cartesian-1:points.items', kind: 'value:number', value: '7' }));
    expect(roundTripped.nodes).toContainEqual({ id: 'cartesian-1', kind: 'cartesian', value: undefined });
    expect(roundTripped.edges).toEqual(expect.arrayContaining(raw.edges));
  });
});

