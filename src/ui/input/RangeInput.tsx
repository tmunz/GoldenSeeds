import * as React from 'react';

import './RangeInput.styl';


export interface Props {
  className?: string;
  label?: string;
  value?: string;
  rangeValue?: any;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export class RangeInput extends React.Component<Props> {

  render() {
    return <div className='input range-input'>
      <input
        className={this.props.className}
        type="range"
        onChange={(e) => this.props.onChange(parseFloat(e.target.value))}
        value={`${isFinite(this.props.rangeValue) ? this.props.rangeValue : ''}`}
        min={this.props.min}
        max={this.props.max}
        step={this.props.step}
      />
      <label>
        {this.props.label}
      </label>
      <output>{this.props.value}</output>
    </div>;
  }
}
