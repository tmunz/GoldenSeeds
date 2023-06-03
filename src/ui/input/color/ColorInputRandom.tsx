import React from 'react';
import { Color } from '../../../datatypes/Color';
import { RANDOM_GRADIENT } from './color-channel-config/RandomConfig';

import './ColorInputRandom.styl';


export function ColorInputRandom(props: {
  color: Color,
  onSelect: (color: Color) => void,
}) {
  return <div className="color-input-random">
    <input
      style={{
        background: RANDOM_GRADIENT,
        color: props.color.getHsla().l <= 50 ? '#FFF' : '#000'
      }}
      onClick={() => props.onSelect(new Color(props.color).withRandom())}
      type="button"
      value="random"
    />
  </div>

}