import { Config } from '../config/Config';
import { RawConfig, RawGraphNode } from '../config/RawConfig';
import { GraphNode } from './GraphNode';
import { generatorNodeRegistry } from './GeneratorNodeRegistry';
import { valueNodeRegistry, VALUE_KIND_PREFIX, ValueNodeConfig } from './ValueNodeRegistry';
import { createRenderNode, ensureRenderNode, RENDER_NODE_KIND } from './RenderNode';
import { ParamDefinitionType } from '../generator/SvgGenerator';

/** Converts a persisted RawConfig into a live, evaluable Config (graph + layout + meta). */
export async function fromRawConfig(rawConfig: RawConfig): Promise<Config> {
  const nodes: GraphNode[] = await Promise.all(rawConfig.nodes.map((n) => nodeFromRaw(n)));
  const graph = ensureRenderNode({ nodes, edges: rawConfig.edges });

  return { meta: rawConfig.meta, graph, layout: rawConfig.layout ?? {} };
}

/** Converts a live Config back into its persisted RawConfig form. */
export function toRawConfig(config: Config): RawConfig {
  const nodes: RawGraphNode[] = config.graph.nodes.map((node) => {
    if (node.kind.startsWith(VALUE_KIND_PREFIX)) {
      const { state } = node.config as ValueNodeConfig;
      return { id: node.id, kind: node.kind, value: state.getTextValue() };
    }
    return { id: node.id, kind: node.kind };
  });
  return { meta: config.meta, nodes, edges: config.graph.edges, layout: config.layout };
}

async function nodeFromRaw(raw: RawGraphNode): Promise<GraphNode> {
  if (raw.kind === RENDER_NODE_KIND) {
    return createRenderNode();
  }
  if (raw.kind.startsWith(VALUE_KIND_PREFIX)) {
    const paramType = raw.kind.slice(VALUE_KIND_PREFIX.length) as ParamDefinitionType;
    return valueNodeRegistry.createNode(paramType, raw.id, raw.value ?? '');
  }
  return generatorNodeRegistry.createNode(raw.kind, raw.id);
}

