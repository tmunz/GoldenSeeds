import { fromRawConfig, toRawConfig } from './GraphSerializer';
import { RENDER_NODE_ID } from '../nodes/render/RenderNode';
import { paramPortId } from '../parameters/ParamPorts';
import { graphEvaluator } from './GraphEvaluator';
import { graphNodeWidth, GRAPH_RIGHT_MARGIN, NODE_GRID_SIZE } from '../model/GraphLayout';

describe('GraphSerializer', () => {
  test('loads saved positions on the grid to the left of the output and stays stable on reload', async () => {
    const raw = {
      meta: { name: 'saved positions' },
      nodes: [{ id: 'generator', kind: 'cartesian' }, { id: 'number', kind: 'value:number', value: '7' }],
      edges: [],
      layout: { generator: { x: 555.78, y: 53.8 }, number: { x: 315.98, y: 52.5 }, 'render-output': { x: 9000, y: 1000 } },
    };
    const config = await fromRawConfig(raw);
    expect(config.layout).toEqual({ generator: { x: -420, y: 60 }, number: { x: -660, y: 60 } });
    expect((await fromRawConfig(toRawConfig(config))).layout).toEqual(config.layout);
    expect(raw.layout.generator).toEqual({ x: 555.78, y: 53.8 });
  });

  test('positions nodes without a saved layout inside the right edge', async () => {
    const config = await fromRawConfig({
      meta: { name: 'no layout' }, nodes: [{ id: 'number', kind: 'value:number', value: '1' }], edges: [],
    });
    expect(config.layout.number).toEqual({ x: -280, y: 0 });
  });

  test('every preset is already on the snap grid and aligned with the right margin', () => {
    // Include inactive presets too, so enabling one preserves the same coordinate system.
    const fs = require('fs');
    const path = require('path');
    const directory = path.resolve(__dirname, '../../config/data');
    fs.readdirSync(directory).filter((file: string) => file.endsWith('.json')).forEach((file: string) => {
      const raw = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
      const nodes = raw.nodes.filter((node: { kind: string }) => node.kind !== 'render');
      const right = Math.max(...nodes.map((node: { id: string; kind: string }) => {
        const { x, y } = raw.layout[node.id];
        expect(Number.isInteger(x / NODE_GRID_SIZE)).toBe(true);
        expect(Number.isInteger(y / NODE_GRID_SIZE)).toBe(true);
        return x + graphNodeWidth(node.kind);
      }));
      expect(right).toBeLessThanOrEqual(-GRAPH_RIGHT_MARGIN);
      expect(right).toBeGreaterThan(-GRAPH_RIGHT_MARGIN - NODE_GRID_SIZE);
    });
  });

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

