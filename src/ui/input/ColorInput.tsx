import React from 'react';
import { Color } from '../../datatypes/Color';

import './ColorInput.styl';
import { AdvancedColorPicker } from './color/AdvancedColorPicker';

export interface Props {
  className?: string;
  label?: string;
  value?: Color;
  onChange: (value: string) => void;
}

export class ColorInput extends React.Component<Props> {

  render() {
    console.log(this.props.value);
    return (
      <div className="input color-input">
        <label>{this.props.label}</label>
        <AdvancedColorPicker
          color={this.props.value}
          onChange={value => this.props.onChange(value.toRaw())}
        />
      </div>
    );
  }
}
