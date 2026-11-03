import { ConfigImportError, findSuspiciousExpressions, parseRawConfig } from './ConfigValidation';
import { preconfigs } from './data';

const valid = {
  meta: { name: 'drawing' },
  nodes: [
    { id: 'a', kind: 'cartesian', parameters: { grid: { items: '4' } } },
    { id: 'a:grid.x', kind: 'value:number', value: '2' },
  ],
  edges: [
    { id: 'e1', from: { nodeId: 'a:grid.x', port: 'out' }, to: { nodeId: 'a', port: 'param:grid.x' } },
    { id: 'e2', from: { nodeId: 'a', port: 'svg' }, to: { nodeId: 'render-output', port: 'svg' } },
  ],
};

function errorKey(input: unknown, fallback?: string): string | undefined {
  try {
    parseRawConfig(typeof input === 'string' ? input : JSON.stringify(input), fallback);
  } catch (error) {
    return error instanceof ConfigImportError ? error.key : 'unexpected';
  }
}

describe('parseRawConfig', () => {
  test('accepts a valid drawing, including edges to the implicit render node', () => {
    expect(parseRawConfig(JSON.stringify(valid)).nodes).toHaveLength(2);
  });

  test.each(preconfigs.map(config => [config.meta.name, config]))('accepts the preset %s', (_name, config) => {
    expect(() => parseRawConfig(JSON.stringify(config))).not.toThrow();
  });

  test('rejects text that is not JSON or not a drawing', () => {
    expect(errorKey('{nope')).toBe('import.error.json');
    expect(errorKey([])).toBe('import.error.format');
    expect(errorKey({ meta: { name: 'x' } })).toBe('import.error.format');
  });

  test('falls back to the file name when the drawing has no name', () => {
    expect(parseRawConfig(JSON.stringify({ ...valid, meta: {} }), 'from file').meta.name).toBe('from file');
    expect(errorKey({ ...valid, meta: {} })).toBe('import.error.name');
  });

  test('rejects malformed nodes and unknown node kinds', () => {
    expect(errorKey({ ...valid, nodes: [{ id: 'a' }] })).toBe('import.error.node');
    expect(errorKey({ ...valid, nodes: [{ id: 'a', kind: 'cartesian', value: 3 }] })).toBe('import.error.node');
    expect(errorKey({ ...valid, nodes: [{ id: 'a', kind: 'cartesian', parameters: { grid: { items: 4 } } }] })).toBe('import.error.node');
    expect(errorKey({ ...valid, nodes: [{ id: 'a', kind: 'hologram' }], edges: [] })).toBe('import.error.unknownKind');
    expect(errorKey({ ...valid, nodes: [{ id: 'a', kind: 'value:hologram' }], edges: [] })).toBe('import.error.unknownKind');
  });

  test('rejects duplicate ids and edges to missing nodes', () => {
    expect(errorKey({ ...valid, nodes: [valid.nodes[0], valid.nodes[0]], edges: [] })).toBe('import.error.duplicateNode');
    expect(errorKey({ ...valid, edges: [valid.edges[0], valid.edges[0]] })).toBe('import.error.duplicateEdge');
    expect(errorKey({ ...valid, edges: [{ ...valid.edges[0], from: { nodeId: 'ghost', port: 'out' } }] })).toBe('import.error.danglingEdge');
    expect(errorKey({ ...valid, edges: [{ id: 'x', from: {}, to: {} }] })).toBe('import.error.edge');
  });

  test('keeps valid layout positions and ignores the rest', () => {
    const config = parseRawConfig(JSON.stringify({ ...valid, layout: { a: { x: 1, y: 2 }, b: { x: 'no' }, c: 5 } }));
    expect(config.layout).toEqual({ a: { x: 1, y: 2 } });
  });
});

describe('findSuspiciousExpressions', () => {
  const withExpression = (text: string) => parseRawConfig(JSON.stringify({
    meta: { name: 'x' },
    nodes: [
      { id: 'f', kind: 'function', parameters: { plot: { functionX: text } } },
      { id: 'v', kind: 'value:expression', value: 'n' },
    ],
    edges: [],
  }));

  test('allows plain math, including the preset formulas', () => {
    expect(findSuspiciousExpressions(withExpression('Math.sin(n) * goldenRatio'))).toEqual([]);
    preconfigs.forEach(config => expect(findSuspiciousExpressions(config)).toEqual([]));
  });

  test.each(['fetch("https://example.com")', 'window.location', '(0).constructor.constructor("x")()', 'this'])('flags %s', (text) => {
    expect(findSuspiciousExpressions(withExpression(text))).toEqual([text]);
  });

  test('checks value nodes and ignores plain string parameters', () => {
    const config = parseRawConfig(JSON.stringify({
      meta: { name: 'x' },
      nodes: [
        { id: 'v', kind: 'value:expression', value: 'document.cookie' },
        { id: 't', kind: 'text', parameters: { text: { content: 'window' } } },
      ],
      edges: [],
    }));
    expect(findSuspiciousExpressions(config)).toEqual(['document.cookie']);
  });
});
