import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useGraphAnimation } from './useGraphAnimation';
import { generatorNodeRegistry } from '../graph/nodes/generator/GeneratorNodeRegistry';
import { valueNodeRegistry, ValueNodeConfig } from '../graph/nodes/value/ValueNodeRegistry';
import { ensureRenderNode } from '../graph/nodes/render/RenderNode';
import { GraphEvaluator } from '../graph/runtime/GraphEvaluator';
import { Graph } from '../graph/model/Graph';
import { GeneratorNodeConfig } from '../graph/nodes/generator/GeneratorNode';

function Preview({ graph }: { graph?: Graph }) {
  const animation = useGraphAnimation(graph);
  if (!graph) { return <output>loading</output>; }
  const result = new GraphEvaluator().evaluate(animation.graph).outputsByNode.polar.points;
  return <output>{result.type === 'points' ? result.value.length : 'invalid'}</output>;
}

test('the first preview starts at zero before effects or animation timers run', async () => {
  const node = await generatorNodeRegistry.createNode('polar', 'polar');
  const graph = ensureRenderNode({ nodes: [node], edges: [] });
  expect(renderToStaticMarkup(<Preview graph={graph} />)).toBe('<output>0</output>');
  expect((node.config as GeneratorNodeConfig).parameters.grid.items.getValue()).toBe(21);
});

test('the first frame also starts at zero when the animated count comes from a value node', async () => {
  const node = await generatorNodeRegistry.createNode('polar', 'polar');
  const number = await valueNodeRegistry.createNode('number', 'count', '12');
  const graph = ensureRenderNode({ nodes: [node, number], edges: [{
    id: 'count->polar', from: { nodeId: 'count', port: 'out' }, to: { nodeId: 'polar', port: 'param:grid.items' },
  }] });
  expect(renderToStaticMarkup(<Preview graph={graph} />)).toBe('<output>0</output>');
  expect((number.config as ValueNodeConfig).state.getValue()).toBe(12);
});

test('graphs without a startup animation render their actual values immediately', async () => {
  const node = await generatorNodeRegistry.createNode('shape', 'shape');
  const graph = ensureRenderNode({ nodes: [node], edges: [] });
  function StaticPreview() {
    const animation = useGraphAnimation(graph);
    return <output>{animation.graph === graph ? 'unchanged' : 'modified'}</output>;
  }
  expect(renderToStaticMarkup(<StaticPreview />)).toBe('<output>unchanged</output>');
  expect(renderToStaticMarkup(<Preview />)).toBe('<output>loading</output>');
});
