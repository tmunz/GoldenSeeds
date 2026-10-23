import { Font } from 'opentype.js';
import { DEFAULT_DISTRIBUTION_TEXT, DISTRIBUTION_DEFINITION } from '../../datatypes/ProbabilityDistribution';
import { Stage } from '../config/Stage';
import { NumberState } from '../config/stageItemState/NumberState';
import { FontState } from '../config/stageItemState/FontState';
import { fontService } from '../font/FontService';
import { generatorNodeRegistry } from './GeneratorNodeRegistry';
import { valueNodeRegistry, ValueNodeConfig } from './ValueNodeRegistry';
import { editGraphNode } from './NodeEditing';
import { GraphNode } from './GraphNode';
import { GraphEvaluator } from './GraphEvaluator';
import { fromRawConfig, toRawConfig } from './GraphSerializer';
import { parameterPortValue, parameterEditorText, resolveParameter, valueEditorDefinition } from './ParameterValues';
import { parseParameter } from '../config/stageItemState/ParseParameter';

const font = (name: string) => new Font({ familyName: name, styleName: 'Regular', unitsPerEm: 1000, ascender: 800, descender: -200, glyphs: [] });

describe('shared immutable node editing', () => {
  afterEach(() => jest.restoreAllMocks());

  test.each([
    ['number', '2', '3'], ['expression', 'n * 2', 'n * 3'], ['string', 'old', ''],
    ['color', 'gold', 'red'], ['distribution', DEFAULT_DISTRIBUTION_TEXT, '{"sigma":0.4}'],
  ] as const)('preserves %s value-node snapshots for undo and redo', async (type, before, after) => {
    const original = await valueNodeRegistry.createNode(type, 'value', before);
    const beforeText = (original.config as ValueNodeConfig).state.getTextValue();
    const edited = editGraphNode(original, { kind: 'value', text: after });
    expect(edited).not.toBe(original);
    const afterText = (edited.config as ValueNodeConfig).state.getTextValue();
    expect(afterText).not.toBe(beforeText);
    // History retains these exact node references. Evaluation and serialization must read their own states.
    for (const [snapshot, expected] of [[original, beforeText], [edited, afterText], [original, beforeText], [edited, afterText]] as const) {
      const raw = toRawConfig({ meta: { name: 'history' }, graph: { nodes: [snapshot], edges: [] }, layout: {} });
      expect(raw.nodes[0].value).toBe(expected);
      const restored = await fromRawConfig(raw);
      expect(new GraphEvaluator().evaluate(restored.graph).outputsByNode.value.out.type).toBe(type);
    }
    expect((original.config as ValueNodeConfig).state.getTextValue()).toBe(beforeText);
  });

  test('font replacement preserves the previous font', async () => {
    const originalFont = font('Original');
    const replacement = font('Replacement');
    jest.spyOn(fontService, 'get').mockResolvedValue(originalFont);
    const original = await valueNodeRegistry.createNode('font', 'font', 'Original');
    const edited = editGraphNode(original, { kind: 'font', value: replacement });
    expect(((original.config as ValueNodeConfig).state as FontState).getValue()).toBe(originalFont);
    expect(((edited.config as ValueNodeConfig).state as FontState).getValue()).toBe(replacement);
  });

  test('distribution field edits are immutable and use the same rules for connected numbers', async () => {
    const original = await valueNodeRegistry.createNode('distribution', 'distribution', DEFAULT_DISTRIBUTION_TEXT);
    const edited = editGraphNode(original, { kind: 'parameter', portId: 'sigma', text: '0.4' });
    const evaluator = new GraphEvaluator();
    const evaluate = (node: GraphNode = original, override?: number) => {
      const output = node.evaluate(override === undefined ? {} : { sigma: { type: 'number', value: override } }).out;
      return output.type === 'distribution' ? output.value : undefined;
    };
    expect(evaluate()?.sigma).toBe(0);
    expect(evaluate(edited)?.sigma).toBe(0.4);
    expect(evaluate(edited, 0.8)?.sigma).toBe(0.8);
    for (const value of [-1, 2, NaN, Infinity]) {
      expect(editGraphNode(edited, { kind: 'parameter', portId: 'sigma', text: String(value) })).toBe(edited);
      expect(evaluate(edited, value)?.sigma).toBe(0.4);
    }
    expect(editGraphNode(edited, { kind: 'parameter', portId: 'sigma', text: '' })).toBe(edited);
    expect(evaluator.evaluate({ nodes: [original], edges: [] }).outputsByNode.distribution.out).not.toEqual(
      evaluator.evaluate({ nodes: [edited], edges: [] }).outputsByNode.distribution.out);
  });

  test('inline and standalone numbers reject partially numeric text', async () => {
    const number = await valueNodeRegistry.createNode('number', 'number', '2');
    const shape = await generatorNodeRegistry.createNode('shape', 'shape');
    for (const text of ['12abc', '1.2.3', '', 'Infinity']) {
      expect(editGraphNode(number, { kind: 'value', text })).toBe(number);
      expect(editGraphNode(shape, { kind: 'parameter', portId: 'param:shape.edges', text })).toBe(shape);
      const state = new NumberState();
      await state.setTextValue(text);
      expect(state.isValid()).toBe(false);
    }
    expect(parseParameter(DISTRIBUTION_DEFINITION.sigma, '0.5')?.getValue()).toBe(0.5);
  });

  test('selection conversion and serialization preserve the generator option name', async () => {
    const shape = await generatorNodeRegistry.createNode('shape', 'shape');
    const stage = shape.config as Stage;
    const definition = stage.generator.definition.projection.type;
    const state = stage.state.data.projection.type;
    expect(parameterEditorText(definition, state)).toBe('1');
    expect(parameterPortValue(definition, state)).toEqual({ type: 'number', value: 1 });
    expect(resolveParameter(definition, 'circular', { type: 'number', value: 0 })).toBe('linear');
    expect(resolveParameter(definition, 'circular', { type: 'number', value: 2 })).toBe('circular');
    expect(valueEditorDefinition(definition)).toMatchObject({ type: 'number', min: 0, max: 1, step: 1 });
  });

  test('unchanged defaults stay omitted, including canonical colors', async () => {
    const shape = await generatorNodeRegistry.createNode('shape', 'shape');
    const raw = toRawConfig({ meta: { name: 'defaults' }, graph: { nodes: [shape], edges: [] }, layout: {} });
    expect(raw.nodes[0]).toEqual({ id: 'shape', kind: 'shape' });
  });
});
