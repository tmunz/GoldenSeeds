import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ParamDefinition } from '../generator/SvgGenerator';
import { PortValue, PortValueType } from './PortValue';
import { formatPortValue } from './PortValueFormat';
import { portColor } from './PortColors';
import { ParameterEditor } from './ParameterEditor';

import './InputPort.styl';

export function InputPort({ id, type, definition, localText = '', connected, value, onChange }: {
  id: string;
  type: PortValueType;
  definition?: ParamDefinition;
  localText?: string;
  connected: boolean;
  value?: PortValue;
  onChange: (text: string) => boolean;
}) {
  // Color/font/distribution still have dedicated value-node editors in generator views.
  const editable = !connected && definition && ['number', 'expression', 'string', 'selection'].includes(definition.type);
  let preview = formatPortValue(value);
  if (definition?.type === 'selection' && value?.type === 'number') {
    preview += `: ${definition.options[value.value] ?? 'invalid index'}`;
  }
  return (
    <div className={`input-port${editable ? ' input-port-editable' : ''}`}>
      <Handle type="target" position={Position.Left} id={id} style={{ background: portColor(type) }} />
      {editable ? <ParameterEditor portId={id} label={id} value={localText} definition={definition} onChange={onChange} /> : <>
        <span className="input-port-label">{id}</span>
        <span className={`input-port-value${connected ? '' : ' input-port-value-default'}`}>{preview}</span>
      </>}
    </div>
  );
}
