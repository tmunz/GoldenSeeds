import React from 'react';

import './Input.styl';
import './RangeInput.styl';

export function RangeInput<T>(props: {
  className?: string;
  label?: string;
  value?: number;
  output?: string;
  options?: T[];
  onChange: (value: T) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="input range-input">
      <input
        className={props.className}
        type="range"
        onChange={(e) => {
          const targetValue = parseFloat(e.target.value);
          props.onChange(props.options ? props.options[targetValue] : (targetValue as unknown as T));
        }}
        value={props.value}
        min={props.min}
        max={props.max}
        step={props.step}
      />
      <label>{props.label}</label>
      <output>{props.output}</output>
    </div>
  );
}
