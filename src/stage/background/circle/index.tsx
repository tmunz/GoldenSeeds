import React from 'react';

import { Background } from '../Background';
import { ColorConverter } from '../../../converter';
import { Color } from '../../../datatypes/Color';
import { CircleBackgroundDrawer } from './CircleBackgroundDrawer';

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
      result: <CircleBackgroundDrawer config={config} />,
      boundingBox: { x: -size / 2, y: -size / 2, w: size, h: size },
    };
  }
}
