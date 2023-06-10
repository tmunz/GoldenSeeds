import React from 'react';
import { Color } from '../../../datatypes/Color';

import './ColorInputSelection.styl';


export function ColorInputSelection(props: {
  onSelect: (color: Color) => void,
}) {
  return <div className="color-input-selection">
    {[
      'black', 'darkgray', 'gray', 'lightgray', 'white', 
      'red', 'orange', 'yellow', 'gold', 'darkOrange', 
      'lime', 'green', 'spring', 'patina', 'britishRacing', 
      'cyan', 'brescian', 'blue', 'pastelblue', 'marian', 
      'purple', 'magenta', 'neonrose', 'pastelviolet', 'coral',
    ]
      .map(cv => new Color(cv))
      .map((c, i) => <input
        key={i}
        type="button"
        style={{ background: c.getRgbaString() }}
        className="color-input-cell"
        onClick={() => props.onSelect(c)}
      />)
    }
  </div>;

}
