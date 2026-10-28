import { GeneratorNodeConfig } from './GeneratorNode';
import { generatorNodeRegistry } from './GeneratorNodeRegistry';
import { valueNodeRegistry } from './ValueNodeRegistry';
import { withParameter } from './GeneratorParameters';
import { fromRawConfig, toRawConfig } from './GraphSerializer';
import { GraphEvaluator } from './GraphEvaluator';
import { collectParamPorts } from './ParamPorts';

describe('inline generator numbers', () => {
  test.each(['shape', 'cartesian', 'polar', 'voronoi', 'tree', 'function'])(
    'edits and saves every numeric parameter of %s without changing earlier snapshots', async (kind) => {
      const original = await generatorNodeRegistry.createNode(kind, 'generator');
      const config = original.config as GeneratorNodeConfig;
      const ports = collectParamPorts(config.generator.definition).filter((port) => config.generator.definition[port.groupId][port.id].type === 'number');
      expect(ports.length).toBeGreaterThan(0);
      for (const port of ports) {
        const before = config.parameters[port.groupId][port.id].getTextValue();
        const value = String(Number(before) + 1);
        const edited = withParameter(original, port.portId, value);
        expect((original.config as GeneratorNodeConfig).parameters[port.groupId][port.id].getTextValue()).toBe(before);
        expect((edited.config as GeneratorNodeConfig).parameters[port.groupId][port.id].getTextValue()).toBe(value);
        const raw = toRawConfig({ meta: { name: kind }, graph: { nodes: [edited], edges: [] }, layout: {} });
        expect(raw.nodes[0].parameters?.[port.groupId]?.[port.id]).toBe(value);
        const restored = await fromRawConfig(raw);
        expect((restored.graph.nodes[0].config as GeneratorNodeConfig).parameters[port.groupId][port.id].getTextValue()).toBe(value);
      }
    },
  );

  test('connected number overrides the saved local value; disconnect restores it', async () => {
    const node = withParameter(await generatorNodeRegistry.createNode('cartesian', 'grid'), 'param:grid.items', '4');
    const number = await valueNodeRegistry.createNode('number', 'count', '7');
    const graph = {
      nodes: [node, number],
      edges: [{ id: 'count->grid', from: { nodeId: 'count', port: 'out' }, to: { nodeId: 'grid', port: 'param:grid.items' } }],
    };
    const restored = (await fromRawConfig(toRawConfig({ meta: { name: 'numbers' }, graph, layout: {} }))).graph;
    const evaluator = new GraphEvaluator();
    const connected = evaluator.evaluate(restored).outputsByNode.grid.grid;
    expect(connected.type === 'grid' && connected.value.length).toBe(7);
    const disconnected = evaluator.evaluate({ ...restored, edges: [] }).outputsByNode.grid.grid;
    expect(disconnected.type === 'grid' && disconnected.value.length).toBe(4);
  });

  test('rejects invalid edits and edits to other input types', async () => {
    const node = await generatorNodeRegistry.createNode('shape', 'shape');
    for (const text of ['', '-', 'NaN', 'Infinity']) {
      expect(withParameter(node, 'param:shape.edges', text)).toBe(node);
    }
    expect(withParameter(node, 'param:style.fillColor', '1')).toBe(node);
    expect(withParameter(node, 'grid', '1')).toBe(node);
  });
});
