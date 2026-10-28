import { GeneratorNodeConfig } from '../graph/GeneratorNode';
import { generatorNodeRegistry } from '../graph/GeneratorNodeRegistry';
import { valueNodeRegistry, ValueNodeConfig } from '../graph/ValueNodeRegistry';
import { GraphEvaluator } from '../graph/GraphEvaluator';
import { toRawConfig } from '../graph/GraphSerializer';
import { DEFAULT_DISTRIBUTION_TEXT } from '../../datatypes/ProbabilityDistribution';
import { applyNumberAnimations, animationValue, startupAnimationTarget, NumberAnimationTarget } from './GraphAnimation';

const numberDefinition = { type: 'number' as const, initial: '0', min: 0, max: 100, step: 1 };

describe('graph number animation', () => {
  test('animates numeric sources through their connections without changing targets or saved data', async () => {
    const number = await valueNodeRegistry.createNode('number', 'count', '10');
    const generator = await generatorNodeRegistry.createNode('polar', 'polar');
    const graph = { nodes: [number, generator], edges: [{
      id: 'count->polar', from: { nodeId: 'count', port: 'out' }, to: { nodeId: 'polar', port: 'param:grid.items' },
    }] };
    const saved = toRawConfig({ meta: { name: 'animation' }, graph, layout: {} });
    const input = { nodeId: 'count', target: 10, definition: numberDefinition };
    const evaluator = new GraphEvaluator();
    for (const value of [0, 5, 10]) {
      const animated = applyNumberAnimations(graph, [{ input, value }]);
      const output = evaluator.evaluate(animated).outputsByNode.polar.grid;
      expect(output.type === 'grid' && output.value.length).toBe(value);
      expect((number.config as ValueNodeConfig).state.getValue()).toBe(10);
      expect(toRawConfig({ meta: { name: 'animation' }, graph, layout: {} })).toEqual(saved);
    }
    expect(applyNumberAnimations(graph, [])).toBe(graph);
  });

  test('applies inline and distribution frames independently', async () => {
    const generator = await generatorNodeRegistry.createNode('polar', 'polar');
    const distribution = await valueNodeRegistry.createNode('distribution', 'distribution', DEFAULT_DISTRIBUTION_TEXT);
    const graph = { nodes: [generator, distribution], edges: [] };
    const inputs: NumberAnimationTarget[] = [
      { nodeId: 'polar', portId: 'param:grid.items', target: 21, definition: numberDefinition },
      { nodeId: 'distribution', portId: 'sigma', target: 0.8, definition: { type: 'number', initial: '0', step: 0.05 } },
    ];
    const animated = applyNumberAnimations(graph, [{ input: inputs[0], value: 5 }, { input: inputs[1], value: 0.4 }]);
    expect((animated.nodes[0].config as GeneratorNodeConfig).parameters.grid.items.getValue()).toBe(5);
    const value = animated.nodes[1].evaluate({}).out;
    expect(value.type === 'distribution' && value.value.sigma).toBe(0.4);
    expect((generator.config as GeneratorNodeConfig).parameters.grid.items.getValue()).toBe(21);
  });

  test('startup chooses the connected number, or the inline marked parameter', async () => {
    const generator = await generatorNodeRegistry.createNode('polar', 'polar');
    const number = await valueNodeRegistry.createNode('number', 'count', '12');
    const graph = { nodes: [generator, number], edges: [] };
    expect(startupAnimationTarget(graph)).toMatchObject({ nodeId: 'polar', portId: 'param:grid.items', target: 21 });
    expect(startupAnimationTarget({ ...graph, edges: [{
      id: 'count->polar', from: { nodeId: 'count', port: 'out' }, to: { nodeId: 'polar', port: 'param:grid.items' },
    }] })).toMatchObject({ nodeId: 'count', target: 12 });
  });

  test('integer controls keep integer frames and fractional targets remain continuous', () => {
    const input = { nodeId: 'count', target: 10, definition: numberDefinition };
    expect(animationValue(input, 3.6)).toBe(4);
    expect(animationValue({ ...input, target: 0.8 }, 0.36)).toBe(0.36);
  });

  test.each([
    ['cartesian', 'param:grid.x'], ['function', 'param:style.resolution'], ['shape', 'param:shape.edges'],
  ])('zero frames for %s remain renderable', async (kind, portId) => {
    const node = await generatorNodeRegistry.createNode(kind, 'generator');
    const graph = applyNumberAnimations({ nodes: [node], edges: [] }, [{
      input: { nodeId: node.id, portId, target: 10, definition: numberDefinition }, value: 0,
    }]);
    const output = new GraphEvaluator().evaluate(graph).outputsByNode.generator;
    expect(JSON.stringify(output)).not.toMatch(/NaN|Infinity/);
    expect(output.svg.type === 'svg' && output.svg.value).not.toMatch(/NaN|Infinity/);
  });
});
