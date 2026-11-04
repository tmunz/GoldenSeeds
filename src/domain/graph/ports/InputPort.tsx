import React from 'react';
import { useTranslation } from '../../../i18n/I18n';
import { ParamDefinition } from '../../generator/SvgGenerator';
import { PortValue, PortValueType } from '../model/PortValue';
import { formatPortValue } from './PortValueFormat';
import { ParameterEditor } from '../parameters/ParameterEditor';
import { parameterDefaultText } from '../parameters/ParameterValues';
import { GraphPortHandle } from './GraphPortHandle';
import { PortGuidance } from '../editor/ConnectionGuidance';

import './InputPort.css';

export function InputPort({ id, label = id, type, definition, localText = '', connected, value, onChange, guidance }: {
  id: string;
  label?: string;
  type: PortValueType;
  definition?: ParamDefinition;
  localText?: string;
  connected: boolean;
  value?: PortValue;
  guidance?: PortGuidance;
  onChange: (text: string) => boolean;
}) {
  const { t, locale } = useTranslation();
  const hasEditor = definition && ['number', 'expression', 'string', 'selection', 'points'].includes(definition.type);
  const defaultText = definition?.type === 'selection'
    ? String(definition.options.indexOf(definition.initial)) : definition ? parameterDefaultText(definition) : '';
  const isDefault = !connected && (!definition || localText === defaultText);
  let preview = formatPortValue(value, t, locale);
  if (definition?.type === 'selection' && value?.type === 'number') {
    preview += `: ${t(`options.${definition.options[value.value]}`, {}, definition.options[value.value] ?? t('options.invalid'))}`;
  }
  return (
    <div className={`input-port${hasEditor ? ' input-port-editable' : ''}${isDefault ? ' input-port-default' : ''}${guidance ? ` input-${guidance}` : ''}`}>
      <GraphPortHandle direction="target" id={id} portType={type} guidance={guidance} />
      <div className="input-port-content">
        {hasEditor && <div className={`input-port-editor${connected ? ' input-port-hidden' : ''}`}
          aria-hidden={connected} {...(connected ? { inert: '' } : {})}>
          <ParameterEditor portId={id} label={label} value={localText} definition={definition} onChange={onChange} />
        </div>}
        <div className={`input-port-preview${hasEditor && !connected ? ' input-port-hidden' : ''}`}
          aria-hidden={Boolean(hasEditor && !connected)}>
          <span className="input-port-label" title={label}>{label}</span>
          <span className={`input-port-value${isDefault ? ' input-port-value-default' : ''}`} title={preview}>
            {value?.type === 'color' ? (
              <span className="input-port-color" role="img" aria-label={t('ports.colorPreview', { color: preview })}>
                <span style={{ backgroundColor: value.value.getRgbaString() }} />
              </span>
            ) : preview}
          </span>
        </div>
      </div>
    </div>
  );
}
