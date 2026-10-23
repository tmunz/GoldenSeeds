import { Stage } from '../config/Stage';
import { StringState } from '../config/stageItemState/StringState';
import { ExpressionState } from '../config/stageItemState/ExpressionState';
import { NumberState } from '../config/stageItemState/NumberState';
import { GraphNode } from './GraphNode';
import { parseParamPortId, selectionOptions } from './ParamPorts';
import { stageToGraphNode } from './StageGraphAdapter';

/** Replace a local parameter without mutating the node kept in undo history. */
export function withParameter(node: GraphNode, portId: string, text: string): GraphNode {
  const param = parseParamPortId(portId);
  const stage = node.config as Stage | undefined;
  const value = Number(text);
  if (!param || !stage?.generator) {
    return node;
  }
  const definition = stage.generator.definition[param.groupId]?.[param.id];
  if (definition?.type !== 'string' && text.trim() === '') {
    return node;
  }
  let state: NumberState | StringState | ExpressionState;
  if (definition?.type === 'string') {
    state = new StringState();
    state.setValue(text);
  } else if (definition?.type === 'expression') {
    state = new ExpressionState();
    state.setValue(text, false);
    if (!state.isValid()) {
      return node;
    }
  } else if (definition?.type === 'selection') {
    const options = selectionOptions(definition);
    if (!Number.isInteger(value) || value < 0 || value >= options.length) {
      return node;
    }
    state = new StringState();
    state.setValue(options[value]);
  } else if (definition?.type === 'number' && Number.isFinite(value)) {
    state = new NumberState();
    state.setValue(value);
  } else {
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
      if ((definition.type === 'number' || definition.type === 'selection' || definition.type === 'expression' || definition.type === 'string') && state.getTextValue() !== definition.initial) {
        (parameters[groupId] ??= {})[id] = state.getTextValue();
      }
    });
  });
  return parameters;
}
