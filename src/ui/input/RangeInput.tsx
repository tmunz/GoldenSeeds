import React from 'react';

import './Input.styl';
import './RangeInput.styl';

export interface Props<T> {
  className?: string;
  label?: string;
  value?: number;
  output?: string;
  options?: T[];
  onChange: (value: T) => void;
  min?: number;
  max?: number;
  step?: number;
}

export class RangeInput<T> extends React.Component<Props<T>> {
  render() {
    return (
      <div className="input range-input">
        <input
          className={this.props.className}
          type="range"
          onChange={(e) => {
            const targetValue = parseFloat(e.target.value);
            this.props.onChange(this.props.options ? this.props.options[targetValue] : targetValue as unknown as T);
          }}
          value={this.props.value}
          min={this.props.min}
          max={this.props.max}
          step={this.props.step}
        />
        <label>{this.props.label}</label>
        <output>{this.props.output}</output>
      </div>
    );
  }
}
