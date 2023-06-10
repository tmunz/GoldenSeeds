import React from 'react';
import { RangeInput } from './RangeInput';
import { TextInput } from './TextInput';

import './Input.styl';
import './ExtendedRangeInput.styl';


export function ExtendedRangeInput(props: {
  className?: string;
  label?: string;
  value?: any;
  output?: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const value = Number.parseFloat(props.value);
  return (
    <div className="extended-range-input" >
      <TextInput {...props} />
      <RangeInput<number>
        {...{
          ...props,
          value: isFinite(value) ? value : 0,
          label: undefined,
          output: undefined,
          onChange: (value) => props.onChange(`${value}`),
        }}
      />
    </div>
  );
}
