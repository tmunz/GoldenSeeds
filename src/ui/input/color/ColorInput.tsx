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
  value: string,
  onChange: (acn: string) => void,
  label?: string;
  alphaDisabled?: boolean;
}) {

  const COLOR_MODES: ColorMode[] = ['rgb', 'hsl', 'select', 'random'];

  const [colorMode, setColorMode] = useState<ColorMode | null>(null);

  useEffect(() => {
    const c = new Color(props.value);
    if (c.isRandom()) {
      setColorMode('random');
    } else if (colorMode === null) {
      setColorMode(COLOR_MODES[0]);
    }
  }, [props.value]);

  const color = new Color(props.value);

  return <div className="color-input">
    <label>{props.label}</label>
    <div
      className="color-input-main"
      style={{ background: color.isRandom() ? RANDOM_GRADIENT : color.getRgbaString(), }}
    >
      {(colorMode === 'rgb' || colorMode === 'hsl') && <ColorInputChannels
        color={color}
        onChange={(c: Color) => props.onChange(c.getAcn())}
        alphaDisabled={props.alphaDisabled}
        colorMode={colorMode}
      />}
      {colorMode === 'random' && <ColorInputRandom
        color={color}
        onSelect={(c: Color) => props.onChange(c.getAcn())}
      />}
      {colorMode === 'select' && <ColorInputSelection
        onSelect={(c: Color) => props.onChange(c.getAcn())}
      />}
    </div>
    <CarouselSelector
      items={COLOR_MODES.map(c => ({ name: c.toString(), svg: null }))}
      selected={colorMode ?? undefined}
      select={(c) => setColorMode(c as ColorMode)}
    />
  </div>
}