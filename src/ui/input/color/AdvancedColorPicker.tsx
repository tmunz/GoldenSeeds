import React from 'react';
import { CustomPickerProps, InjectedColorProps, CustomPicker } from 'react-color';
import { Saturation, Checkboard, Hue, Alpha } from 'react-color/lib/components/common';

import './AdvancedColorPicker.styl';

function AdvancedColorPicker(props: CustomPickerProps<InjectedColorProps> & InjectedColorProps) {
  const selectionPage = (
    <div>
      <div className="saturation">
        <Saturation hsl={props.hsl} hsv={props.hsv} onChange={props.onChange} />
      </div>
      <div className="hue">
        <Hue hsl={props.hsl} onChange={props.onChange} />
      </div>
      <div className="alpha">
        <Checkboard />
        <Alpha rgb={props.rgb} hsl={props.hsl} onChange={props.onChange} />
      </div>
    </div>
  );

  return <div className="advanced-color-picker">{selectionPage}</div>;
}

export default CustomPicker(AdvancedColorPicker);
