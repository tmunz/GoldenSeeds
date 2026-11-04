import { GeneratorNodeConfig } from '../nodes/generator/GeneratorNode';
import { parameterOverrides } from '../parameters/GeneratorParameters';
import { Config } from '../../config/Config';
import { RawConfig, RawGraphNode } from '../../config/RawConfig';
import { GraphNode } from '../model/GraphNode';
import { alignGraphLayout } from '../model/GraphLayout';
import { generatorNodeRegistry } from '../nodes/generator/GeneratorNodeRegistry';
import { valueNodeRegistry, VALUE_KIND_PREFIX, ValueNodeConfig } from '../nodes/value/ValueNodeRegistry';
import { createRenderNode, ensureRenderNode, RENDER_NODE_KIND } from '../nodes/render/RenderNode';
import { ParamDefinitionType } from '../../generator/SvgGenerator';

/** Converts a persisted RawConfig into a live, evaluable Config (graph + layout + meta). */
export async function fromRawConfig(rawConfig: RawConfig): Promise<Config> {
  const nodes: GraphNode[] = await Promise.all(rawConfig.nodes.map((n) => nodeFromRaw(n)));
  const graph = ensureRenderNode({ nodes, edges: rawConfig.edges });

  return { meta: rawConfig.meta, graph, layout: alignGraphLayout(graph.nodes, rawConfig.layout) };
}

/** Converts a live Config back into its persisted RawConfig form. */
export function toRawConfig(config: Config): RawConfig {
  return { meta: config.meta, nodes: config.graph.nodes.map(nodeToRaw), edges: config.graph.edges, layout: config.layout };
}

/** Converts a live node into its persisted form; only parameters that differ from the defaults are kept. */
export function nodeToRaw(node: GraphNode): RawGraphNode {
  if (node.kind.startsWith(VALUE_KIND_PREFIX)) {
    const { state } = node.config as ValueNodeConfig;
    return { id: node.id, kind: node.kind, value: state.getTextValue() };
  }
  if (node.kind !== RENDER_NODE_KIND) {
    const parameters = parameterOverrides(node.config as GeneratorNodeConfig);
    if (Object.keys(parameters).length > 0) {
      return { id: node.id, kind: node.kind, parameters };
    }
  }
  return { id: node.id, kind: node.kind };
}

/** Builds a fresh live node (with its own parameter state) from its persisted form. */
export async function nodeFromRaw(raw: RawGraphNode): Promise<GraphNode> {
  if (raw.kind === RENDER_NODE_KIND) {
    return createRenderNode();
  }
  if (raw.kind.startsWith(VALUE_KIND_PREFIX)) {
    const paramType = raw.kind.slice(VALUE_KIND_PREFIX.length) as ParamDefinitionType;
    return valueNodeRegistry.createNode(paramType, raw.id, raw.value ?? '');
  }
  return generatorNodeRegistry.createNode(raw.kind, raw.id, raw.parameters);
}

