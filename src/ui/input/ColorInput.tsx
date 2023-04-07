import React, { useState, Fragment } from 'react';
import { Color, COLORS } from '../../datatypes/Color';
import AdvancedColorPicker from './color/AdvancedColorPicker';

import './ColorInput.styl';
import { AnimatedButton } from '../AnimatedButton';
import { CirclePicker } from 'react-color';
import { Input } from './Input';


export interface Props {
  className?: string;
  label?: string;
  value?: Color;
  onChange: (value: string) => void;
  simple: boolean;
}

export function ColorInput(props: Props) {

  const [selectedPage, setSelectedPage] = useState<number>(0);

  const pages = [
    <CirclePicker
      width="180px"
      color={props.value?.toRgba()}
      onChange={(value: any) => props.onChange(new Color(value.rgb).toRaw())}
      colors={['gold', 'patina', 'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta']
        .map(c => new Color(c).toRgbHex())}
    />,
    <div>
      <Input
        value={props.value?.toRgbHex()}
        onChange={(value: any) => props.onChange(new Color(value).toRaw())}
      />
    </div>,
    <AdvancedColorPicker
      color={props.value?.toRgba()}
      onChange={(value: any) => props.onChange(new Color(value.rgb).toRaw())}
    />,
  ];

  return (
    <div className="input color-input">
      {!props.simple &&
        <Fragment>
          <label>{props.label}</label>
          <AnimatedButton
            rotation={AnimatedButton.DIRECTION_LEFT}
            onClick={() => setSelectedPage((selectedPage + 1) % pages.length)}
          />
          <AnimatedButton
            rotation={AnimatedButton.DIRECTION_RIGHT}
            onClick={() => setSelectedPage((selectedPage + pages.length - 1) % pages.length)}
          />
        </Fragment>
      }
      <div className="color-selection-page">
        {pages[selectedPage]}
      </div>
      {!props.simple &&
        <div onClick={() => props.onChange(new Color('random').toRaw())}>
          random
        </div>
      }
    </div>
  );
}
