import React from 'react';

import { Drawer } from '../Drawer';
import { NumberConverter, ColorConverter, ListConverter } from '../../../converter';
import { VoronoiDrawer, VoronoiConfig } from './VoronoiDrawer';
import { DrawStyle } from '../../../datatypes/DrawStyle';


export class Voronoi extends Drawer {

  type = 'voronoi';

  initialState = {
    color: 'gold',
    style: 'stroke',
    borderWidth: '2',
  };

  converter = {
    color: new ColorConverter('color'),
    style: new ListConverter<DrawStyle>('style', [DrawStyle.FILLED, DrawStyle.STROKE]),
    borderWidth: new NumberConverter('borderWidth', { min: 0, max: 10, step: 1 }),
  };

  generate = (config: VoronoiConfig, grid: { result: number[][]; boundingBox: BoundingBox }) => {
    return {
      result: <VoronoiDrawer config={config} grid={grid.result} />,
      boundingBox: grid.boundingBox
    };
  }
}
