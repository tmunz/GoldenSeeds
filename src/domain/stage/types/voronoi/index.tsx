import React from 'react';

import { VoronoiDrawer, VoronoiConfig } from './VoronoiDrawer';
import { DrawStyle } from '../../../../datatypes/DrawStyle';
import { StageResult, Stage } from '../../Stage';


export class Voronoi extends Stage {

  static type = 'voronoi';
  type = Voronoi.type;

  definition = {
    color: { initial: 'gold', type: 'color' as const },
    style: { initial: DrawStyle.STROKE, type: { name: 'selection' as const, options: [DrawStyle.FILLED, DrawStyle.STROKE] } },
    borderWidth: { initial: '2', type: { name: 'number' as const, min: 0, max: 10, step: 1 } },
  };

  generate = (config: VoronoiConfig, prev: StageResult) => {
    return {
      render: <VoronoiDrawer config={config} grid={prev.grid} />,
      boundingBox: prev.boundingBox,
      grid: prev.grid,
    };
  }
}
