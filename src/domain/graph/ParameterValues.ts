import { parseParameter } from '../parameter/ParseParameter';
import { ParamDefinition } from '../generator/SvgGenerator';
import { ParameterState } from '../parameter/ParameterState';
import { PortValue } from './PortValue';
import { PARAM_TYPE_TO_PORT_TYPE } from './ParamPorts';

export function parameterEditorText(definition: ParamDefinition, state: ParameterState<unknown, unknown>): string {
  return definition.type === 'selection' ? String(definition.options.indexOf(state.getTextValue())) : state.getTextValue();
}

export function parameterPortValue(definition: ParamDefinition, state: ParameterState<unknown, unknown>): PortValue {
  return definition.type === 'selection'
    ? { type: 'number', value: Number(parameterEditorText(definition, state)) }
    : { type: PARAM_TYPE_TO_PORT_TYPE[definition.type], value: state.getValue() } as PortValue;
}

export function resolveParameter(definition: ParamDefinition, fallback: unknown, connected: PortValue | undefined): unknown {
  if (definition.type === 'selection') {
    const index = connected?.type === 'number' ? connected.value : -1;
    return Number.isInteger(index) && index >= 0 && index < definition.options.length ? definition.options[index] : fallback;
  }
  return connected?.type === PARAM_TYPE_TO_PORT_TYPE[definition.type] ? connected.value : fallback;
}

/** A numeric source driving an option input should offer integer indexes in the option range. */
export function valueEditorDefinition(definition: ParamDefinition): ParamDefinition {
  return definition.type === 'selection' ? {
    type: 'number', initial: String(definition.options.indexOf(definition.initial)),
    min: 0, max: Math.max(0, definition.options.length - 1), step: 1,
  } : definition;
}

/** Compare serialized defaults using the same canonical representation as state. */
export function parameterDefaultText(definition: ParamDefinition): string {
  if (definition.type === 'color' || definition.type === 'number') {
    return parseParameter(definition, definition.initial)?.getTextValue() ?? definition.initial;
  }
  return definition.initial;
}
