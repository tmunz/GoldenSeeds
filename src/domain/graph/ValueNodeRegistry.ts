import { DEFAULT_DISTRIBUTION_TEXT, DISTRIBUTION_FIELDS, isDistributionFieldValue, ProbabilityDistribution } from '../../datatypes/ProbabilityDistribution';
import { ParamDefinition, ParamDefinitionType } from '../generator/SvgGenerator';
import { StageItemState } from '../config/stageItemState/StageItemState';
import { stageItemStateService } from '../config/stageItemState/StageItemStateService';
import { GraphNode } from './GraphNode';
import { PortValue } from './PortValue';
import { PARAM_TYPE_TO_PORT_TYPE } from './ParamPorts';

export const VALUE_OUT_PORT = 'out';
export const VALUE_KIND_PREFIX = 'value:';

/** Builds the node kind for a value node of the given param type, e.g. 'value:color'. */
export function valueNodeKind(type: ParamDefinitionType): string {
  return `${VALUE_KIND_PREFIX}${type}`;
}

/**
 * Sensible standalone defaults for each value node type's ParamDefinition (min/max/step,
 * selection options, ...), used as a fallback whenever a value node isn't currently connected to
 * a generator parameter (see GraphCanvas, which derives the definition to show from whatever
 * param port the node is connected to, instead of persisting it on the node itself).
 */
export const DEFAULT_VALUE_DEFINITIONS: Record<ParamDefinitionType, ParamDefinition> = {
  number: { initial: '0', type: 'number', min: 0, max: 100, step: 1 },
  expression: { initial: '() => 1', type: 'expression', min: -10, max: 10, step: 0.1 },
  distribution: { initial: DEFAULT_DISTRIBUTION_TEXT, type: 'distribution' },
  color: { initial: 'gold', type: 'color' },
  selection: { initial: '0', type: 'number', min: 0, max: 100, step: 1 },
  string: { initial: '', type: 'string' },
  font: { initial: '', type: 'font' },
};

export interface ValueNodeConfig {
  state: StageItemState<unknown, unknown>;
}

/** Build a value node around fresh state; its evaluation closure never changes that state. */
export function createValueNode(type: ParamDefinitionType, id: string, state: ValueNodeConfig['state']): GraphNode<ValueNodeConfig> {
  const portType = PARAM_TYPE_TO_PORT_TYPE[type];
  return {
    id, kind: valueNodeKind(type),
    inputs: type === 'distribution' ? DISTRIBUTION_FIELDS.map((id) => ({ id, type: 'number' as const })) : [],
    outputs: [{ id: VALUE_OUT_PORT, type: portType }],
    config: { state },
    evaluate: (inputs) => {
      if (type === 'distribution') {
        const value = { ...state.getValue() as ProbabilityDistribution };
        DISTRIBUTION_FIELDS.forEach((field) => {
          const input = inputs[field];
          if (input?.type === 'number' && isDistributionFieldValue(field, input.value)) {
            value[field] = input.value;
          }
        });
        return { [VALUE_OUT_PORT]: { type: 'distribution', value } };
      }
      return { [VALUE_OUT_PORT]: { type: portType, value: state.getValue() } as PortValue };
    },
  };
}

export class ValueNodeRegistry {
  async createNode(type: ParamDefinitionType, id: string, textValue: string): Promise<GraphNode<ValueNodeConfig>> {
    const state = await stageItemStateService.createState(type === 'selection' ? 'number' : type, textValue);
    return createValueNode(type, id, state);
  }
}

export const valueNodeRegistry = new ValueNodeRegistry();
