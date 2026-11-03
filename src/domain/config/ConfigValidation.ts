import { GraphEdge } from '../graph/model/GraphEdge';
import { GraphLayout } from '../graph/model/GraphLayout';
import { RENDER_NODE_ID, RENDER_NODE_KIND } from '../graph/nodes/render/RenderNode';
import { DEFAULT_VALUE_DEFINITIONS, VALUE_KIND_PREFIX } from '../graph/nodes/value/ValueNodeRegistry';
import { svgGeneratorRegistry } from '../generator/SvgGeneratorRegistry';
import { RawConfig, RawGraphNode } from './RawConfig';

/** A rejected import. The key and values are meant for the translator, never for display as-is. */
export class ConfigImportError extends Error {
  constructor(readonly key: string, readonly values: Record<string, string | number> = {}) {
    super(key);
  }
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function parseNode(raw: unknown, index: number): RawGraphNode {
  if (!isRecord(raw) || !isNonEmptyString(raw.id) || !isNonEmptyString(raw.kind)) {
    throw new ConfigImportError('import.error.node', { index: index + 1 });
  }
  const { id, kind } = raw;
  const known = kind === RENDER_NODE_KIND
    || (kind.startsWith(VALUE_KIND_PREFIX) && kind.slice(VALUE_KIND_PREFIX.length) in DEFAULT_VALUE_DEFINITIONS)
    || svgGeneratorRegistry.types.includes(kind);
  if (!known) { throw new ConfigImportError('import.error.unknownKind', { kind }); }

  const node: RawGraphNode = { id, kind };
  if (raw.value !== undefined) {
    if (typeof raw.value !== 'string') { throw new ConfigImportError('import.error.node', { index: index + 1 }); }
    node.value = raw.value;
  }
  if (raw.parameters !== undefined) {
    const groups = raw.parameters;
    const valid = isRecord(groups) && Object.values(groups).every(group =>
      isRecord(group) && Object.values(group).every(value => typeof value === 'string'));
    if (!valid) { throw new ConfigImportError('import.error.node', { index: index + 1 }); }
    node.parameters = groups as Record<string, Record<string, string>>;
  }
  return node;
}

function parseEdge(raw: unknown, index: number): GraphEdge {
  const valid = (end: unknown): end is { nodeId: string; port: string } =>
    isRecord(end) && isNonEmptyString(end.nodeId) && isNonEmptyString(end.port);
  if (!isRecord(raw) || !isNonEmptyString(raw.id) || !valid(raw.from) || !valid(raw.to)) {
    throw new ConfigImportError('import.error.edge', { index: index + 1 });
  }
  return {
    id: raw.id,
    from: { nodeId: raw.from.nodeId, port: raw.from.port },
    to: { nodeId: raw.to.nodeId, port: raw.to.port },
  };
}

function parseLayout(raw: unknown): GraphLayout {
  if (!isRecord(raw)) { return {}; }
  const layout: GraphLayout = {};
  Object.entries(raw).forEach(([id, position]) => {
    if (isRecord(position) && Number.isFinite(position.x) && Number.isFinite(position.y)) {
      layout[id] = { x: position.x as number, y: position.y as number };
    }
  });
  return layout;
}

/** Turn imported JSON text into a RawConfig, or explain what is wrong with it. */
export function parseRawConfig(text: string, fallbackName = ''): RawConfig {
  let root: unknown;
  try {
    root = JSON.parse(text);
  } catch {
    throw new ConfigImportError('import.error.json');
  }
  if (!isRecord(root) || !Array.isArray(root.nodes) || !Array.isArray(root.edges)) {
    throw new ConfigImportError('import.error.format');
  }

  const name = isRecord(root.meta) && isNonEmptyString(root.meta.name) ? root.meta.name.trim() : fallbackName.trim();
  if (!name) { throw new ConfigImportError('import.error.name'); }

  const nodes = root.nodes.map(parseNode);
  const nodeIds = new Set<string>();
  nodes.forEach(node => {
    if (nodeIds.has(node.id)) { throw new ConfigImportError('import.error.duplicateNode', { id: node.id }); }
    nodeIds.add(node.id);
  });
  // A missing render node is added on load, so edges may already point to it.
  nodeIds.add(RENDER_NODE_ID);

  const edges = root.edges.map(parseEdge);
  const edgeIds = new Set<string>();
  edges.forEach(edge => {
    if (edgeIds.has(edge.id)) { throw new ConfigImportError('import.error.duplicateEdge', { id: edge.id }); }
    edgeIds.add(edge.id);
    [edge.from.nodeId, edge.to.nodeId].forEach(nodeId => {
      if (!nodeIds.has(nodeId)) { throw new ConfigImportError('import.error.danglingEdge', { id: edge.id, node: nodeId }); }
    });
  });

  return { meta: { name }, nodes, edges, layout: parseLayout(root.layout) };
}

// Expressions are evaluated as code. This is a sanity check that catches obvious attempts to reach
// the page, the network or storage - it is not a security boundary, so imports are only
// accepted after the user confirmed any hit.
const FORBIDDEN_IDENTIFIERS = new RegExp(`\\b(${[
  'window', 'document', 'globalThis', 'self', 'top', 'parent', 'frames', 'this', 'eval', 'Function', 'import', 'require',
  'constructor', 'prototype', '__proto__', 'fetch', 'XMLHttpRequest', 'WebSocket', 'Worker', 'localStorage',
  'sessionStorage', 'indexedDB', 'navigator', 'location', 'cookie', 'postMessage', 'setTimeout', 'setInterval',
  'alert', 'process',
].join('|')})\\b`);

/** All formula texts of a config that reference anything beyond plain math. */
export function findSuspiciousExpressions(config: RawConfig): string[] {
  const texts: string[] = [];
  config.nodes.forEach(node => {
    if (node.kind === `${VALUE_KIND_PREFIX}expression` && node.value !== undefined) {
      texts.push(node.value);
    }
    const generator = svgGeneratorRegistry.newInstance(node.kind);
    Object.entries(node.parameters ?? {}).forEach(([groupId, group]) => {
      Object.entries(group).forEach(([id, text]) => {
        if (generator?.definition[groupId]?.[id]?.type === 'expression') { texts.push(text); }
      });
    });
  });
  return texts.filter(text => FORBIDDEN_IDENTIFIERS.test(text));
}
