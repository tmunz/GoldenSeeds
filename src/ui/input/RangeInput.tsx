import React from 'react';

import './Input.css';
import './RangeInput.css';

export function RangeInput(props: {
  className?: string;
  value?: number;
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
        onChange={(event) => props.onChange(Number(event.target.value))}
        value={props.value}
        min={props.min}
        max={props.max}
        step={props.step}
      />
    </div>
  );
}
