import React from 'react';
import { ChromePicker, RGBColor } from 'react-color';
import { Color } from '../../datatypes/Color';

import './ColorInput.styl';
import { AdvancedColorPicker } from './color/AdvancedColorPicker';

export interface Props {
  className?: string;
  label?: string;
  value?: string;
  onChange: (value: string) => void;
}

export class ColorInput extends React.Component<Props> {

  render() {
    return (
      <div className="input color-input">
        <label>{this.props.label}</label>
        <AdvancedColorPicker
          color={new Color(this.props.value ?? '')}
          onChange={value => this.props.onChange(value.toRaw())}
        />
      </div>
    );
  }
}
