import { ParamDefinition, ParamDefinitionType } from '../generator/SvgGenerator';
import { PortDefinition, PortValueType } from './PortValue';

export const PARAM_TYPE_TO_PORT_TYPE: Record<ParamDefinitionType, PortValueType> = {
  number: 'number',
  expression: 'expression',
  color: 'color',
  selection: 'string',
  string: 'string',
  font: 'font',
};

export interface ParamPort {
  groupId: string;
  id: string;
  portId: string;
  portType: PortValueType;
}

/** Builds the input port id for a generator parameter, e.g. paramPortId('style', 'fillColor') -> 'param:style.fillColor'. */
export function paramPortId(groupId: string, id: string): string {
  return `param:${groupId}.${id}`;
}

/** Flattens a generator's { groupId: { paramId: ParamDefinition } } definition into a list of graph ports. */
export function collectParamPorts(definition: Record<string, Record<string, ParamDefinition>>): ParamPort[] {
  const ports: ParamPort[] = [];
  Object.keys(definition).forEach((groupId) => {
    Object.keys(definition[groupId]).forEach((id) => {
      const portType = PARAM_TYPE_TO_PORT_TYPE[definition[groupId][id].type];
      ports.push({ groupId, id, portId: paramPortId(groupId, id), portType });
    });
  });
  return ports;
}

export function paramPortDefinitions(definition: Record<string, Record<string, ParamDefinition>>): PortDefinition[] {
  return collectParamPorts(definition).map((p) => ({ id: p.portId, type: p.portType }));
}
