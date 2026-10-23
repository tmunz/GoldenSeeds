import { parameterDefaultText } from './ParameterValues';
import { Stage } from '../config/Stage';
import { parseParameter } from '../config/stageItemState/ParseParameter';
import { GraphNode } from './GraphNode';
import { parseParamPortId } from './ParamPorts';
import { stageToGraphNode } from './StageGraphAdapter';

/** Replace a local parameter without mutating the node kept in undo history. */
export function withParameter(node: GraphNode, portId: string, text: string): GraphNode {
  const param = parseParamPortId(portId);
  const stage = node.config as Stage | undefined;
  if (!param || !stage?.generator) { return node; }
  const definition = stage.generator.definition[param.groupId]?.[param.id];
  if (!definition) { return node; }
  const state = parseParameter(definition, text);
  if (!state) {
    return node;
  }
  const nextStage = Object.assign(new Stage(stage.id, stage.name), stage, {
    state: {
      ...stage.state,
      data: {
        ...stage.state.data,
        [param.groupId]: { ...stage.state.data[param.groupId], [param.id]: state },
      },
    },
  });
  return stageToGraphNode(nextStage);
}

/** Only store overrides; missing fields continue to use generator defaults. */
export function parameterOverrides(stage: Stage): Record<string, Record<string, string>> {
  const parameters: Record<string, Record<string, string>> = {};
  Object.entries(stage.generator.definition).forEach(([groupId, group]) => {
    Object.entries(group).forEach(([id, definition]) => {
      const state = stage.state.data[groupId][id];
      if (state.getTextValue() !== parameterDefaultText(definition)) {
        (parameters[groupId] ??= {})[id] = state.getTextValue();
      }
    });
  });
  return parameters;
}
