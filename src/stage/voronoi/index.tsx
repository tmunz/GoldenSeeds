import React from 'react';

import { NumberConverter, ColorConverter, ListConverter } from '../../converter';
import { VoronoiDrawer, VoronoiConfig } from './VoronoiDrawer';
import { DrawStyle } from '../../datatypes/DrawStyle';
import { StageResult, Stage } from '../Stage';


export class Voronoi extends Stage {

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

  generate = (config: VoronoiConfig, prev: StageResult) => {
    return {
      render: <VoronoiDrawer config={config} grid={prev.grid} />,
      boundingBox: prev.boundingBox,
      grid: prev.grid,
    };
  }
}
