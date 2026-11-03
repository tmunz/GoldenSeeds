import React from 'react';

import './Input.css';
import './RangeInput.css';

export function RangeInput(props: {
  className?: string;
  label?: string;
  value?: number;
  valueText?: string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="input range-input">
      <input
        className={props.className}
        type="range"
        aria-label={props.label}
        aria-valuetext={props.valueText}
        onChange={(event) => props.onChange(Number(event.target.value))}
        value={props.value}
        min={props.min}
        max={props.max}
        step={props.step}
      />
    </div>
  );
}
