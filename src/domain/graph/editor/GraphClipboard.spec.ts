import { collectFragment, instantiateFragment } from './GraphClipboard';
import { fromRawConfig } from '../runtime/GraphSerializer';
import { RENDER_NODE_ID } from '../nodes/render/RenderNode';
import { graphEvaluator } from '../runtime/GraphEvaluator';

const raw = {
  meta: { name: 'stage' },
  nodes: [
    { id: 'shape', kind: 'shape', parameters: { shape: { edges: '5' } } },
    { id: 'shape:fill', kind: 'value:color', value: '0x0ffdecd87' },
    { id: 'shared', kind: 'value:number', value: '3' },
    { id: 'grid', kind: 'cartesian' },
  ],
  edges: [
    { id: 'c', from: { nodeId: 'shape:fill', port: 'out' }, to: { nodeId: 'shape', port: 'param:style.fillColor' } },
    { id: 's1', from: { nodeId: 'shared', port: 'out' }, to: { nodeId: 'shape', port: 'param:style.strokeWidth' } },
    { id: 's2', from: { nodeId: 'shared', port: 'out' }, to: { nodeId: 'grid', port: 'param:grid.x' } },
    { id: 'chain', from: { nodeId: 'grid', port: 'points' }, to: { nodeId: 'shape', port: 'points' } },
    { id: 'out', from: { nodeId: 'shape', port: 'svg' }, to: { nodeId: RENDER_NODE_ID, port: 'svg' } },
  ],
  layout: { shape: { x: 100, y: 50 }, 'shape:fill': { x: 0, y: 50 } },
};

function defined<T>(value: T | undefined): T {
  if (value === undefined) { throw new Error('Expected a value'); }
  return value;
}

describe('GraphClipboard', () => {
  test('copies the value nodes that only feed the selection, but not shared ones or render connections', async () => {
    const { graph, layout } = await fromRawConfig(raw);
    const fragment = collectFragment(graph, layout, ['shape']);
    expect(fragment?.nodes.map(node => node.id).sort()).toEqual(['shape', 'shape:fill']);
    expect(fragment?.edges.map(edge => edge.id)).toEqual(['c']);
    expect(fragment?.nodes.find(node => node.id === 'shape')?.parameters).toEqual({ shape: { edges: '5' } });
  });

  test('keeps connections between selected nodes and ignores the render node', async () => {
    const { graph, layout } = await fromRawConfig(raw);
    const fragment = collectFragment(graph, layout, ['shape', 'grid', RENDER_NODE_ID]);
    expect(fragment?.nodes.map(node => node.id).sort()).toEqual(['grid', 'shape', 'shape:fill', 'shared']);
    expect(fragment?.edges.map(edge => edge.id).sort()).toEqual(['c', 'chain', 's1', 's2']);
    expect(collectFragment(graph, layout, [RENDER_NODE_ID])).toBeUndefined();
    expect(collectFragment(graph, layout, [])).toBeUndefined();
  });

  test('instantiates independent nodes with new ids, rewired connections and shifted positions', async () => {
    const { graph, layout } = await fromRawConfig(raw);
    const fragment = defined(collectFragment(graph, layout, ['shape']));
    const copy = await instantiateFragment(fragment, new Set(graph.nodes.map(node => node.id)), { x: 40, y: 40 });

    const ids = copy.nodes.map(node => node.id);
    expect(ids).toHaveLength(2);
    expect(ids.some(id => ['shape', 'shape:fill'].includes(id))).toBe(false);
    const shape = defined(copy.nodes.find(node => node.kind === 'shape'));
    const fill = defined(copy.nodes.find(node => node.kind === 'value:color'));
    expect(copy.edges).toEqual([{
      id: `${fill.id}.out->${shape.id}.param:style.fillColor`,
      from: { nodeId: fill.id, port: 'out' },
      to: { nodeId: shape.id, port: 'param:style.fillColor' },
    }]);
    expect(copy.layout[shape.id]).toEqual({ x: 140, y: 90 });
    expect(copy.layout[fill.id]).toEqual({ x: 40, y: 90 });

    const original = defined(graph.nodes.find(node => node.id === 'shape'));
    expect(shape.config).not.toBe(original.config);
    const result = graphEvaluator.evaluate({ nodes: copy.nodes, edges: copy.edges }).outputsByNode[shape.id];
    expect(result.svg.type).toBe('svg');
  });
});
