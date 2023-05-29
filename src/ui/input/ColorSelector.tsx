import React from 'react';
import { ColorInput } from './color/ColorInput';


import './ColorSelector.styl';

export interface Props {
  className?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  simple?: boolean;
}

export function ColorSelector(props: Props) {

  // const value = new Color(props.value);

  /*const pages = [
    <CirclePicker
      width="180px"
      color={props.value?.toRgba()}
      onChange={(value: any) => props.onChange(new Color(value.rgb).toRaw())}
      colors={['gold', 'patina', 'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta'].map((c) =>
        new Color(c).getRgbString(),
      )}
    />,
    <AdvancedColorPicker
      color={props.value?.toRgba()}
      onChange={(value: any) => props.onChange(new Color(value.rgb).toRaw())}
    />,
  ];*/

  //  {!props.simple && <div onClick={() => props.onChange(new Color('random').toRaw())}>random</div>}

  return (
    <div className="color-selector">
      <label>{props.label}</label>
      <ColorInput value={props.value} onChange={props.onChange}></ColorInput>
    </div>
  );
}
