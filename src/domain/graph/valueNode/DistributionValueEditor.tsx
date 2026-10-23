import React from 'react';
import { DISTRIBUTION_DEFINITION, DISTRIBUTION_FIELDS, ProbabilityDistribution } from '../../../datatypes/ProbabilityDistribution';
import { PortValue } from '../PortValue';
import { InputPort } from '../InputPort';

export function DistributionValueEditor({ value, inputValues, connectedInputPorts, onChange }: {
  value: ProbabilityDistribution;
  inputValues?: Record<string, PortValue>;
  connectedInputPorts?: Set<string>;
  onChange: (field: keyof ProbabilityDistribution, text: string) => boolean;
}) {
  return <div className="distribution-editor">
    {DISTRIBUTION_FIELDS.map((field) => <InputPort key={field} id={field} type="number"
      definition={DISTRIBUTION_DEFINITION[field]} localText={String(value[field])}
      connected={connectedInputPorts?.has(field) ?? false} value={inputValues?.[field]}
      onChange={(text) => onChange(field, text)} />)}
  </div>;
}
