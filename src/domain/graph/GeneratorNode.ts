import { SvgGenerator } from '../generator/SvgGenerator';
import { ParameterState } from '../parameter/ParameterState';
import { GraphNode } from './GraphNode';
import { collectParamPorts, paramPortId } from './ParamPorts';
import { resolveParameter } from './ParameterValues';
import { RESULT_PORTS, resultInputs } from './GraphResult';

export interface GeneratorNodeConfig {
  generator: SvgGenerator<unknown>;
  parameters: Record<string, Record<string, ParameterState<unknown, unknown>>>;
}

/** Generator parameters are local defaults; connected input values override them during evaluation. */
export function createGeneratorNode(id: string, config: GeneratorNodeConfig): GraphNode<GeneratorNodeConfig> {
  const { generator, parameters } = config;
  return {
    id,
    kind: generator.type,
    inputs: [
      ...RESULT_PORTS,
      ...collectParamPorts(generator.definition).map((port) => ({ id: port.portId, type: port.portType })),
    ],
    outputs: RESULT_PORTS,
    config,
    evaluate: (inputs) => {
      const previous = resultInputs(inputs);
      const values: Record<string, Record<string, unknown>> = {};
      Object.entries(parameters).forEach(([groupId, group]) => {
        values[groupId] = {};
        Object.entries(group).forEach(([id, state]) => {
          values[groupId][id] = resolveParameter(
            generator.definition[groupId][id], state.getValue(), inputs[paramPortId(groupId, id)],
          );
        });
      });
      const result = generator.generate(values, previous);
      return {
        grid: { type: 'grid', value: result.grid },
        svg: { type: 'svg', value: (previous.svg ?? '') + (result.svg ?? '') },
        boundingBox: { type: 'boundingBox', value: result.boundingBox },
      };
    },
  };
}
