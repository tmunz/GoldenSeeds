import React from 'react';

import { Background } from './Background';
import { ColorConverter } from '../../converter';
import { Color } from '../../datatypes/Color';

export class CircleBackground extends Background {

  type = 'circle';

  initialState = {
    color: '#000000',
  };

  converter = {
    color: new ColorConverter('color'),
  };

  generate = (config: { color: Color }) => {
    const size = 1;
    return {
      result: <circle r={size / 2} cx={0} cy={0} fill={config.color.toString()} />,
      boundingBox: { x: -size / 2, y: -size / 2, w: size, h: size },
    };
  }
}
