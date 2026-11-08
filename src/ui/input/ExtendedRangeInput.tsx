import React from 'react';
import { RangeInput } from './RangeInput';
import { TextInput } from './TextInput';

import './Input.css';
import './ExtendedRangeInput.css';


export function ExtendedRangeInput(props: {
  className?: string;
  label?: string;
  value?: string;
  valueText?: string;
  description?: string;
  help?: React.ReactNode;
  helpLabel?: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const value = Number.parseFloat(props.value ?? '');
  return (
    <div className="extended-range-input" >
      <TextInput {...props} value={props.valueText ?? props.value} readOnly={props.valueText !== undefined} />
      <RangeInput
        label={props.label}
        className={props.className}
        value={isFinite(value) ? value : 0}
        valueText={props.valueText}
        min={props.min}
        max={props.max}
        step={props.step}
        onChange={(next) => props.onChange(String(next))}
      />
    </div>
  );
}
