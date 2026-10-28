import { GeneratorNodeConfig } from './GeneratorNode';
import { ExpressionState } from '../parameter/ExpressionState';
import { generatorNodeRegistry } from './GeneratorNodeRegistry';
import { valueNodeRegistry } from './ValueNodeRegistry';
import { collectParamPorts } from './ParamPorts';
import { withParameter } from './GeneratorParameters';
import { fromRawConfig, toRawConfig } from './GraphSerializer';
import { GraphEvaluator } from './GraphEvaluator';

describe('inline generator expressions', () => {
  test.each(['shape', 'cartesian', 'polar', 'function'])(
    'edits and saves expression inputs of %s without mutating earlier snapshots', async (kind) => {
      const original = await generatorNodeRegistry.createNode(kind, 'generator');
      const config = original.config as GeneratorNodeConfig;
      const ports = collectParamPorts(config.generator.definition).filter((port) => port.portType === 'expression');
      expect(ports.length).toBeGreaterThan(0);
      for (const port of ports) {
        const before = config.parameters[port.groupId][port.id].getTextValue();
        const edited = withParameter(original, port.portId, 'n + items + i');
        expect(config.parameters[port.groupId][port.id].getTextValue()).toBe(before);
        const raw = toRawConfig({ meta: { name: kind }, graph: { nodes: [edited], edges: [] }, layout: {} });
        expect(raw.nodes[0].parameters?.[port.groupId]?.[port.id]).toBe('n + items + i');
        const restored = await fromRawConfig(raw);
        const state = (restored.graph.nodes[0].config as GeneratorNodeConfig).parameters[port.groupId][port.id] as ExpressionState;
        expect(state.getValue()(2, 3, () => 1, 1)).toBe(6);
      }
    },
  );

  test('expression node overrides the saved formula, and disconnect restores it', async () => {
    const original = await generatorNodeRegistry.createNode('polar', 'polar', { grid: { items: '3', angle: '0' } });
    const node = withParameter(original, 'param:grid.distance', 'n * 2');
    const expression = await valueNodeRegistry.createNode('expression', 'distance', 'n * 3');
    const graph = {
      nodes: [node, expression],
      edges: [{ id: 'distance->polar', from: { nodeId: 'distance', port: 'out' }, to: { nodeId: 'polar', port: 'param:grid.distance' } }],
    };
    const restored = (await fromRawConfig(toRawConfig({ meta: { name: 'expressions' }, graph, layout: {} }))).graph;
    const evaluator = new GraphEvaluator();
    expect(evaluator.evaluate(restored).outputsByNode.polar.grid).toEqual({ type: 'grid', value: [[3, 0], [6, 0], [9, 0]] });
    expect(evaluator.evaluate({ ...restored, edges: [] }).outputsByNode.polar.grid).toEqual({ type: 'grid', value: [[2, 0], [4, 0], [6, 0]] });
  });

  test('incomplete expressions preserve the last valid formula', async () => {
    const node = withParameter(await generatorNodeRegistry.createNode('shape', 'shape'), 'param:transformation.size', 'n * 2');
    for (const text of ['', 'n *', 'Math.sin(', 'unknownVariable']) {
      expect(withParameter(node, 'param:transformation.size', text)).toBe(node);
    }
    expect(((node.config as GeneratorNodeConfig).parameters.transformation.size as ExpressionState).getValue()(3, 4, () => 1, 1)).toBe(6);
  });
});
