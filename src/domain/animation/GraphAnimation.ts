import { Graph } from '../graph/Graph';
import { NodeEdit, editGraphNode } from '../graph/NodeEditing';
import { ParamDefinition } from '../generator/SvgGenerator';
import { GeneratorNodeConfig } from '../graph/GeneratorNode';
import { collectParamPorts } from '../graph/ParamPorts';
import { VALUE_KIND_PREFIX, ValueNodeConfig } from '../graph/ValueNodeRegistry';

export type NumberDefinition = Extract<ParamDefinition, { type: 'number' }>;
export interface NumberAnimationTarget {
  nodeId: string;
  portId?: string;
  target: number;
  definition: NumberDefinition;
}
export interface NumberAnimationFrame {
  input: NumberAnimationTarget;
  value: number;
}

export function animationKey(nodeId: string, portId?: string): string {
  return JSON.stringify([nodeId, portId ?? null]);
}

/** Animate integer controls in whole increments; continuous values interpolate smoothly. */
export function animationValue(input: NumberAnimationTarget, value: number): number {
  return input.definition.step === 1 && Number.isInteger(input.target) ? Math.round(value) : value;
}

/** Build a temporary graph. Targets, saved configuration, and undo history remain untouched. */
export function applyNumberAnimations(graph: Graph, frames: readonly NumberAnimationFrame[]): Graph {
  if (!frames.length) { return graph; }
  const nodes = graph.nodes.map((node) => frames.reduce((current, frame) => {
    if (frame.input.nodeId !== current.id) { return current; }
    const text = String(frame.value);
    const edit: NodeEdit = frame.input.portId === undefined
      ? { kind: 'value', text, definition: frame.input.definition }
      : { kind: 'parameter', portId: frame.input.portId, text };
    return editGraphNode(current, edit);
  }, node));
  return { ...graph, nodes };
}

/** The startup effect uses the same first marked numeric parameter as the old intro animation. */
export function startupAnimationTarget(graph: Graph): NumberAnimationTarget | undefined {
  for (const node of graph.nodes) {
    if (node.kind.startsWith(VALUE_KIND_PREFIX) || node.kind === 'render') { continue; }
    const config = node.config as GeneratorNodeConfig;
    for (const port of collectParamPorts(config.generator.definition)) {
      const definition = config.generator.definition[port.groupId][port.id];
      if (definition.type !== 'number' || !definition.animateable) { continue; }
      const edge = graph.edges.find((edge) => edge.to.nodeId === node.id && edge.to.port === port.portId);
      if (edge) {
        const source = graph.nodes.find((candidate) => candidate.id === edge.from.nodeId);
        if (source?.kind !== `${VALUE_KIND_PREFIX}number`) { continue; }
        const target = Number((source.config as ValueNodeConfig).state.getValue());
        if (Number.isFinite(target)) { return { nodeId: source.id, target, definition }; }
      } else {
        const target = Number(config.parameters[port.groupId][port.id].getValue());
        if (Number.isFinite(target)) { return { nodeId: node.id, portId: port.portId, target, definition }; }
      }
    }
  }
}
