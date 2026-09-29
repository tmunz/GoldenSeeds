import { Config } from '../config/Config';
import { RawConfig, RawGraphNode } from '../config/RawConfig';
import { GraphNode } from './GraphNode';
import { GraphEdge } from './GraphEdge';
import { generatorNodeRegistry } from './GeneratorNodeRegistry';
import { valueNodeRegistry, VALUE_KIND_PREFIX, VALUE_OUT_PORT, ValueNodeConfig } from './ValueNodeRegistry';
import { createRenderNode, ensureRenderNode, RENDER_NODE_KIND } from './RenderNode';
import { connectResultPorts } from './LegacyStageAdapter';
import { paramPortId } from './ParamPorts';
import { svgGeneratorRegistry } from '../generator/SvgGeneratorRegistry';
import { ParamDefinitionType } from '../generator/SvgGenerator';

/** Converts a persisted RawConfig into a live, evaluable Config (graph + layout + meta). */
export async function fromRawConfig(rawConfig: RawConfig | LegacyRawConfig): Promise<Config> {
  const raw = isLegacyRawConfig(rawConfig) ? migrateLegacyRawConfig(rawConfig) : rawConfig;

  const nodes: GraphNode[] = await Promise.all(raw.nodes.map((n) => nodeFromRaw(n)));
  const graph = ensureRenderNode({ nodes, edges: raw.edges });

  return { meta: raw.meta, graph, layout: raw.layout ?? {} };
}

/** Converts a live Config back into its persisted RawConfig form. */
export function toRawConfig(config: Config): RawConfig {
  const nodes: RawGraphNode[] = config.graph.nodes.map((node) => {
    if (node.kind.startsWith(VALUE_KIND_PREFIX)) {
      const { state, definition } = node.config as ValueNodeConfig;
      return { id: node.id, kind: node.kind, value: state.getTextValue(), definition };
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
    return valueNodeRegistry.createNode(paramType, raw.id, raw.value ?? '', raw.definition);
  }
  return generatorNodeRegistry.createNode(raw.kind, raw.id);
}

// --- legacy migration -------------------------------------------------------------------
// The pre-graph config format stored a flat list of stages, each with its parameter values
// stored inline. Legacy configs aren't otherwise supported anymore - any such config found
// (an old preconfig JSON, an imported file, or a stored IndexedDB entry) is transparently
// migrated to the graph-native format the first time it's loaded.

interface LegacyRawConfigStage {
  type: string;
  data: Record<string, Record<string, string>>;
  id?: string;
  name?: string;
}

export interface LegacyRawConfig {
  meta: { name: string };
  stages: LegacyRawConfigStage[];
}

export function isLegacyRawConfig(rawConfig: RawConfig | LegacyRawConfig): rawConfig is LegacyRawConfig {
  return Array.isArray((rawConfig as LegacyRawConfig).stages);
}

/**
 * One-time migration of the old linear-pipeline config format into the graph-native format:
 * every stage becomes a generator node, and every one of its parameters becomes its own
 * connectable value node (see ValueNodeRegistry) wired into the generator's matching param
 * port (see ParamPorts) - the generator now uses e.g. a color node as input, instead of
 * storing an inline literal value itself.
 */
export function migrateLegacyRawConfig(legacy: LegacyRawConfig): RawConfig {
  const nodes: RawGraphNode[] = [];
  const edges: GraphEdge[] = [];
  let previousStageId: string | undefined;

  legacy.stages.forEach((stageRaw, i) => {
    const stageId = stageRaw.id ?? `stage-${i}`;
    nodes.push({ id: stageId, kind: stageRaw.type });

    const generator = svgGeneratorRegistry.newInstance(stageRaw.type);
    if (generator) {
      Object.keys(stageRaw.data).forEach((groupId) => {
        Object.keys(stageRaw.data[groupId]).forEach((paramId) => {
          const definition = generator.definition[groupId]?.[paramId];
          if (!definition) {
            return;
          }
          const valueNodeId = `${stageId}:${groupId}.${paramId}`;
          nodes.push({ id: valueNodeId, kind: `${VALUE_KIND_PREFIX}${definition.type}`, value: stageRaw.data[groupId][paramId], definition });
          edges.push({
            id: `${valueNodeId}->${stageId}.${paramPortId(groupId, paramId)}`,
            from: { nodeId: valueNodeId, port: VALUE_OUT_PORT },
            to: { nodeId: stageId, port: paramPortId(groupId, paramId) },
          });
        });
      });
    }

    if (previousStageId) {
      edges.push(...connectResultPorts(previousStageId, stageId));
    }
    previousStageId = stageId;
  });

  return { meta: legacy.meta, nodes, edges };
}
