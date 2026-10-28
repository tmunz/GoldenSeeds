import { SvgGeneratorResult } from '../generator/SvgGenerator';
import { GeneratorNodeConfig } from './GeneratorNode';
import { generatorNodeRegistry } from './GeneratorNodeRegistry';
import { valueNodeRegistry } from './ValueNodeRegistry';
import { isValidConnection } from './ConnectionValidator';
import { withParameter } from './GeneratorParameters';
import { fromRawConfig, toRawConfig } from './GraphSerializer';
import { createGeneratorNode } from './GeneratorNode';
import { collectParamPorts } from './ParamPorts';

// Capture the resolved config without tying these tests to individual drawing algorithms.
async function selectionNode() {
  const original = await generatorNodeRegistry.createNode('shape', 'shape');
  const edited = withParameter(original, 'param:projection.type', '0');
  const config = edited.config as GeneratorNodeConfig;
  const generate = jest.fn((_: Record<string, Record<string, unknown>>, prev: SvgGeneratorResult) => prev);
  const generator = Object.assign(Object.create(config.generator), { generate });
  const node = createGeneratorNode(edited.id, { ...config, generator });
  return { original, node, generate };
}

describe('option inputs', () => {
  test('option inputs accept number indexes and reject strings', async () => {
    const node = await generatorNodeRegistry.createNode('shape', 'generator');
    const config = node.config as GeneratorNodeConfig;
    const options = collectParamPorts(config.generator.definition).filter((port) =>
      config.generator.definition[port.groupId][port.id].type === 'selection');
    expect(options.length).toBeGreaterThan(0);
    const number = await valueNodeRegistry.createNode('number', 'index', '0');
    const string = await valueNodeRegistry.createNode('string', 'name', 'linear');
    const graph = { nodes: [node, number, string], edges: [] };
    options.forEach((port) => {
      expect(port.portType).toBe('number');
      expect(isValidConnection(graph, { nodeId: 'index', port: 'out' }, { nodeId: node.id, port: port.portId })).toBe(true);
      expect(isValidConnection(graph, { nodeId: 'name', port: 'out' }, { nodeId: node.id, port: port.portId })).toBe(false);
      const definition = config.generator.definition[port.groupId][port.id];
      if (definition.type !== 'selection') { throw new Error('Expected selection definition'); }
      const values = definition.options;
      const edited = withParameter(node, port.portId, '0');
      expect((edited.config as GeneratorNodeConfig).parameters[port.groupId][port.id].getValue()).toBe(values[0]);
    });
  });

  test('connected indexes override the local selection and disconnect restores it', async () => {
    const { node, generate } = await selectionNode();
    node.evaluate({ 'param:projection.type': { type: 'number', value: 1 } });
    expect(generate.mock.calls[0][0].projection.type).toBe('circular');
    node.evaluate({});
    expect(generate.mock.calls[1][0].projection.type).toBe('linear');
    for (const value of [-1, 2, 0.5, NaN, Infinity]) {
      node.evaluate({ 'param:projection.type': { type: 'number', value } });
      expect(generate.mock.calls[generate.mock.calls.length - 1][0].projection.type).toBe('linear');
    }
  });

  test('local selection is immutable, validates indexes, and survives save/load', async () => {
    const { node, original } = await selectionNode();
    expect((original.config as GeneratorNodeConfig).parameters.projection.type.getValue()).toBe('circular');
    expect(withParameter(node, 'param:projection.type', '0.5')).toBe(node);
    expect(withParameter(node, 'param:projection.type', '2')).toBe(node);
    const saved = toRawConfig({ meta: { name: 'options' }, graph: { nodes: [node], edges: [] }, layout: {} });
    expect(saved.nodes[0].parameters?.projection.type).toBe('linear');
    const restored = await fromRawConfig(saved);
    expect((restored.graph.nodes[0].config as GeneratorNodeConfig).parameters.projection.type.getValue()).toBe('linear');
  });
});
