import { parameterDefaultText } from './ParameterValues';
import { createGeneratorNode, GeneratorNodeConfig } from './GeneratorNode';
import { parseParameter } from '../parameter/ParseParameter';
import { GraphNode } from './GraphNode';
import { parseParamPortId } from './ParamPorts';

/** Replace a local parameter without mutating the node kept in undo history. */
export function withParameter(node: GraphNode, portId: string, text: string): GraphNode {
  const param = parseParamPortId(portId);
  const config = node.config as GeneratorNodeConfig | undefined;
  if (!param || !config?.generator) { return node; }
  const definition = config.generator.definition[param.groupId]?.[param.id];
  if (!definition) { return node; }
  const state = parseParameter(definition, text);
  if (!state) {
    return node;
  }
  return createGeneratorNode(node.id, {
    ...config,
    parameters: {
      ...config.parameters,
      [param.groupId]: { ...config.parameters[param.groupId], [param.id]: state },
    },
  });
}

/** Only store overrides; missing fields continue to use generator defaults. */
export function parameterOverrides(config: GeneratorNodeConfig): Record<string, Record<string, string>> {
  const parameters: Record<string, Record<string, string>> = {};
  Object.entries(config.generator.definition).forEach(([groupId, group]) => {
    Object.entries(group).forEach(([id, definition]) => {
      const state = config.parameters[groupId][id];
      if (state.getTextValue() !== parameterDefaultText(definition)) {
        (parameters[groupId] ??= {})[id] = state.getTextValue();
      }
    });
  });
  return parameters;
}
