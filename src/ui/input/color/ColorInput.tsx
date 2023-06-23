import React, { useState, useEffect } from 'react';
import { Color } from '../../../datatypes/Color';
import { CarouselSelector } from '../../CarouselSelector';
import { ColorInputChannels } from './ColorInputChannels';
import { RANDOM_GRADIENT } from './color-channel-config/RandomConfig';
import { ColorInputRandom } from './ColorInputRandom';
import { ColorInputSelection } from './ColorInputSelection';

import './ColorInput.styl';

type ColorMode = 'rgb' | 'hsl' | 'select' | 'random';

export function ColorInput(props: {
  value: Color | null,
  onChange: (color: Color) => void,
  label?: string;
  alphaDisabled?: boolean;
}) {

  const COLOR_MODES: ColorMode[] = ['rgb', 'hsl', 'select', 'random'];
  const INITIAL_COLOR_MODE = COLOR_MODES[0];

  const [colorMode, setColorMode] = useState<ColorMode | null>(null);
  const [color, setColor] = useState<Color>(new Color(props.value));

  useEffect(() => {
    if (colorMode === null) {
      const c = new Color(props.value);
      if (c.isRandom()) {
        setColorMode('random');
      } else {
        setColorMode(INITIAL_COLOR_MODE);
      }
    }
  }, [props.value, colorMode, INITIAL_COLOR_MODE]);

  function updateColor(c: Color) {
    setColor(c);
    if (c.isValid()) {
      props.onChange?.(c);
    }
  }

  return <div className="color-input polaroid">
    <label>{props.label}</label>
    <div
      className={`color-input-main polaroid-picture${color.isValid() ? '' : ' color-input-invalid'}`}
      style={{ background: color.isRandom() ? RANDOM_GRADIENT : color.getRgbaString(), }}
    >
      {colorMode === 'rgb' && <ColorInputChannels
        color={color}
        onChange={updateColor}
        alphaDisabled={props.alphaDisabled}
        colorMode="rgb"
      />}
      {colorMode === 'hsl' && <ColorInputChannels
        color={color}
        onChange={updateColor}
        alphaDisabled={props.alphaDisabled}
        colorMode="hsl"
      />}
      {colorMode === 'random' && <ColorInputRandom
        color={color}
        onSelect={updateColor}
      />}
      {colorMode === 'select' && <ColorInputSelection
        onSelect={updateColor}
      />}
    </div>
    <CarouselSelector
      items={COLOR_MODES.map(c => ({ name: c.toString(), svg: null }))}
      selected={colorMode ?? undefined}
      select={(c) => setColorMode(c as ColorMode)}
    />
  </div>;
}
