import dandelion from '../config/data/dandelion.json';
import smartify from '../config/data/smartify.json';
import unknownPleasures from '../config/data/unknown-pleasures.json';
import { DEFAULT_DISTRIBUTION, DEFAULT_DISTRIBUTION_TEXT } from '../../datatypes/ProbabilityDistribution';
import { DistributionState } from '../config/stageItemState/DistributionState';
import { RawConfig } from '../config/RawConfig';
import { valueNodeRegistry } from './ValueNodeRegistry';
import { generatorNodeRegistry } from './GeneratorNodeRegistry';
import { fromRawConfig, toRawConfig } from './GraphSerializer';
import { renderGraphToSvg } from './GraphRenderer';
import { GraphEvaluator } from './GraphEvaluator';
import { isValidConnection } from './ConnectionValidator';

describe('distribution inputs', () => {
  test('round-trips parameters and retains the last valid distribution on invalid input', async () => {
    const state = new DistributionState();
    const value = { ...DEFAULT_DISTRIBUTION, sigma: 0.4, seed: 42 };
    await state.setTextValue(JSON.stringify(value));
    expect(state.getValue()).toEqual(value);
    expect(JSON.parse(state.getTextValue())).toEqual(value);
    for (const text of ['invalid', 'null', '{"sigma":-1}', '{"noise":2}', '{"seed":"42"}']) {
      await state.setTextValue(text);
      expect(state.isValid()).toBe(false);
      expect(state.getValue()).toEqual(value);
    }
  });

  test('exposes one typed shape input and accepts distribution values only', async () => {
    const shape = await generatorNodeRegistry.createNode('shape', 'shape');
    const distribution = await valueNodeRegistry.createNode('distribution', 'dist', DEFAULT_DISTRIBUTION_TEXT);
    const number = await valueNodeRegistry.createNode('number', 'number', '0.4');
    const graph = { nodes: [shape, distribution, number], edges: [] };
    expect(shape.inputs).toContainEqual({ id: 'param:shape.distribution', type: 'distribution' });
    expect(shape.inputs.some((port) => port.id.startsWith('param:probabilityDistribution.') || port.id === 'param:variation.seed')).toBe(false);
    expect(isValidConnection(graph, { nodeId: 'dist', port: 'out' }, { nodeId: 'shape', port: 'param:shape.distribution' })).toBe(true);
    expect(isValidConnection(graph, { nodeId: 'number', port: 'out' }, { nodeId: 'shape', port: 'param:shape.distribution' })).toBe(false);
  });

  test('distribution changes shape geometry reproducibly', async () => {
    const shape = await generatorNodeRegistry.createNode('shape', 'shape', {
      shape: { edges: '20' }, projection: { type: 'linear' },
    });
    const inputs = { grid: { type: 'grid' as const, value: [[0, 0]] } };
    const baseline = shape.evaluate(inputs);
    const value = { ...DEFAULT_DISTRIBUTION, sigma: 0.4, muRandomness: 0.5, noise: 0.3 };
    const variedInputs = { ...inputs, 'param:shape.distribution': { type: 'distribution' as const, value } };
    const varied = shape.evaluate(variedInputs);
    expect(varied.svg).not.toEqual(baseline.svg);
    expect(shape.evaluate(variedInputs)).toEqual(varied);
    expect(shape.evaluate({ ...variedInputs, 'param:shape.distribution': {
      type: 'distribution', value: { ...value, seed: 21 },
    } }).svg).not.toEqual(varied.svg);
  });

  test.each([dandelion, smartify, unknownPleasures])('loads updated preset $meta.name with valid connections', async (raw) => {
    // Fonts require browser APIs; validate the procedural portion of each preset here.
    const nodes = raw.nodes.filter((node) => node.kind !== 'text' && node.kind !== 'value:font');
    const ids = new Set(nodes.map((node) => node.id));
    const edges = raw.edges.filter((edge) => ids.has(edge.from.nodeId) && ids.has(edge.to.nodeId));
    const { graph } = await fromRawConfig({ ...raw, nodes, edges });
    graph.edges.forEach((edge) => {
      expect(isValidConnection({ ...graph, edges: graph.edges.filter((other) => other.id !== edge.id) }, edge.from, edge.to)).toBe(true);
    });
    const { outputsByNode } = new GraphEvaluator().evaluate(graph);
    raw.nodes.filter((node) => node.kind === 'value:distribution').forEach((node) => {
      expect(outputsByNode[node.id].out).toEqual({ type: 'distribution', value: JSON.parse(node.value as string) });
    });
  });

  test('Dandelion renders after deleting its distribution, before and after its edge is removed', async () => {
    const deletedId = 'test-distribution';
    const { graph } = await fromRawConfig({
      ...dandelion,
      nodes: [...dandelion.nodes, { id: deletedId, kind: 'value:distribution', value: DEFAULT_DISTRIBUTION_TEXT }],
      edges: [...dandelion.edges, {
        id: 'test-distribution->shape',
        from: { nodeId: deletedId, port: 'out' },
        to: { nodeId: '2', port: 'param:shape.distribution' },
      }],
    });
    const nodes = graph.nodes.filter((node) => node.id !== deletedId);
    const edges = graph.edges.filter((edge) => edge.from.nodeId !== deletedId && edge.to.nodeId !== deletedId);
    const complete = renderGraphToSvg({ nodes, edges }, 500, 500);
    expect(complete).toContain('<svg');
    expect(renderGraphToSvg({ nodes, edges: graph.edges }, 500, 500)).toEqual(complete);
  });

  test('preserves distribution values and numeric connections across saving', async () => {
    const raw: RawConfig = {
      meta: { name: 'distribution' },
      nodes: [
        { id: 'shape', kind: 'shape' },
        { id: 'distribution', kind: 'value:distribution', value: JSON.stringify({ ...DEFAULT_DISTRIBUTION, sigma: 0.4 }) },
        { id: 'seed', kind: 'value:number', value: '21' },
      ],
      edges: [
        { id: 'distribution-edge', from: { nodeId: 'distribution', port: 'out' }, to: { nodeId: 'shape', port: 'param:shape.distribution' } },
        { id: 'seed-edge', from: { nodeId: 'seed', port: 'out' }, to: { nodeId: 'distribution', port: 'seed' } },
      ],
    };
    const config = await fromRawConfig(raw);
    const { outputsByNode } = new GraphEvaluator().evaluate(config.graph);
    expect(outputsByNode.distribution.out).toEqual({
      type: 'distribution', value: { ...DEFAULT_DISTRIBUTION, sigma: 0.4, seed: 21 },
    });
    const reloaded = await fromRawConfig(toRawConfig(config));
    expect(new GraphEvaluator().evaluate(reloaded.graph).outputsByNode).toEqual(outputsByNode);
  });
});
