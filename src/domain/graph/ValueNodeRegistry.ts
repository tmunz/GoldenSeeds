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
  color: { initial: 'gold', type: 'color' },
  selection: { initial: '', type: 'selection', options: [] },
  string: { initial: '', type: 'string' },
  font: { initial: '', type: 'font' },
};

export interface ValueNodeConfig {
  state: StageItemState<unknown, unknown>;
}

/**
 * Source nodes with no inputs and a single typed `out` port, holding a literal value
 * (e.g. a number, color, expression, string or font). These are meant to feed into a
 * generator node's per-parameter input ports (see ParamPorts / StageGraphAdapter),
 * the same way "Number(42)" or "Color(gold)" nodes would in a visual node graph.
 *
 * They reuse the existing StageItemState implementations (NumberState, ColorState, ...)
 * so parsing/validation stays identical to what the parameter editors already do, and are
 * rendered on the graph node itself via the matching editor in ValueNodeView.
 */
export class ValueNodeRegistry {

  /** Creates a value node of the given param type from its raw text representation, e.g. ('color', 'c-1', 'gold'). */
  async createNode(type: ParamDefinitionType, id: string, textValue: string): Promise<GraphNode<ValueNodeConfig>> {
    const state = await stageItemStateService.createState(type, textValue);
    const portType = PARAM_TYPE_TO_PORT_TYPE[type];

    return {
      id,
      kind: valueNodeKind(type),
      inputs: [],
      outputs: [{ id: VALUE_OUT_PORT, type: portType }],
      config: { state },
      evaluate: () => ({ [VALUE_OUT_PORT]: { type: portType, value: state.getValue() } as PortValue }),
    };
  }
}

export const valueNodeRegistry = new ValueNodeRegistry();

