import type { Font } from 'opentype.js';
import { DISTRIBUTION_DEFINITION, DISTRIBUTION_FIELDS, ProbabilityDistribution } from '../../datatypes/ProbabilityDistribution';
import { DistributionState } from '../config/stageItemState/DistributionState';
import { FontState } from '../config/stageItemState/FontState';
import { parseParameter } from '../config/stageItemState/ParseParameter';
import { ParamDefinition, ParamDefinitionType } from '../generator/SvgGenerator';
import { GraphNode } from './GraphNode';
import { withParameter } from './GeneratorParameters';
import { createValueNode, DEFAULT_VALUE_DEFINITIONS, VALUE_KIND_PREFIX, ValueNodeConfig } from './ValueNodeRegistry';

export type NodeEdit =
  | { kind: 'parameter'; portId: string; text: string }
  | { kind: 'value'; text: string; definition?: ParamDefinition }
  | { kind: 'font'; value: Font };

/** Every editor produces a new node, so snapshots can safely share untouched nodes. */
export function editGraphNode(node: GraphNode, edit: NodeEdit): GraphNode {
  if (!node.kind.startsWith(VALUE_KIND_PREFIX)) {
    return edit.kind === 'parameter' ? withParameter(node, edit.portId, edit.text) : node;
  }
  const type = node.kind.slice(VALUE_KIND_PREFIX.length) as ParamDefinitionType;
  if (edit.kind === 'parameter') {
    if (type !== 'distribution' || !DISTRIBUTION_FIELDS.includes(edit.portId as keyof ProbabilityDistribution)) { return node; }
    const field = edit.portId as keyof ProbabilityDistribution;
    const number = parseParameter(DISTRIBUTION_DEFINITION[field], edit.text);
    if (!number) { return node; }
    const state = new DistributionState();
    state.setValue({ ...(node.config as ValueNodeConfig).state.getValue() as ProbabilityDistribution, [field]: number.getValue() });
    return state.isValid() ? createValueNode(type, node.id, state) : node;
  }
  if (edit.kind === 'font') {
    if (type !== 'font') { return node; }
    const state = new FontState();
    state.setValue(edit.value);
    return createValueNode(type, node.id, state);
  }
  const definition = edit.definition ?? DEFAULT_VALUE_DEFINITIONS[type];
  // A value node keeps its own type, even if a connected target has additional editor metadata.
  if (definition.type !== DEFAULT_VALUE_DEFINITIONS[type].type) { return node; }
  const state = parseParameter(definition, edit.text);
  return state ? createValueNode(type, node.id, state) : node;
}
