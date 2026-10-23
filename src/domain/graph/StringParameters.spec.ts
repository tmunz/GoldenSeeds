import { Font, Path } from 'opentype.js';
import { fontService } from '../font/FontService';
import { Stage } from '../config/Stage';
import { generatorNodeRegistry } from './GeneratorNodeRegistry';
import { valueNodeRegistry } from './ValueNodeRegistry';
import { withParameter } from './GeneratorParameters';
import { fromRawConfig, toRawConfig } from './GraphSerializer';
import { GraphEvaluator } from './GraphEvaluator';

const font = new Font({ familyName: 'Test', styleName: 'Regular', unitsPerEm: 1000, ascender: 800, descender: -200 });

describe('inline string inputs', () => {
  beforeEach(() => {
    jest.spyOn(fontService, 'get').mockResolvedValue(font);
    jest.spyOn(font, 'getPath').mockReturnValue(new Path());
  });
  afterEach(() => jest.restoreAllMocks());

  test.each(['Golden Seeds', '', '  spaced text  ', 'Grüße 🌻'])('preserves %p through editing and save/load', async (text) => {
    const original = await generatorNodeRegistry.createNode('text', 'text');
    const edited = withParameter(original, 'param:text.content', text);
    expect((original.config as Stage).state.data.text.content.getValue()).toBe('text');
    expect((edited.config as Stage).state.data.text.content.getValue()).toBe(text);
    const raw = toRawConfig({ meta: { name: 'strings' }, graph: { nodes: [edited], edges: [] }, layout: {} });
    expect(raw.nodes[0].parameters?.text.content).toBe(text);
    const restored = await fromRawConfig(raw);
    expect((restored.graph.nodes[0].config as Stage).state.data.text.content.getValue()).toBe(text);
  });

  test('a string node overrides local text, and disconnect restores it', async () => {
    const text = withParameter(await generatorNodeRegistry.createNode('text', 'text'), 'param:text.content', 'Local');
    const string = await valueNodeRegistry.createNode('string', 'string', 'Connected');
    const graph = {
      nodes: [text, string],
      edges: [{ id: 'string->text', from: { nodeId: 'string', port: 'out' }, to: { nodeId: 'text', port: 'param:text.content' } }],
    };
    const evaluator = new GraphEvaluator();
    evaluator.evaluate(graph);
    expect(font.getPath).toHaveBeenLastCalledWith('Connected', expect.any(Number), expect.any(Number), expect.any(Number), { kerning: true });
    evaluator.evaluate({ ...graph, edges: [] });
    expect(font.getPath).toHaveBeenLastCalledWith('Local', expect.any(Number), expect.any(Number), expect.any(Number), { kerning: true });
  });
});
