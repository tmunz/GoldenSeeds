import React from 'react';

import { NumberConverter, ColorConverter } from '../../converter';
import { TreeConfig, TreeDrawer } from './TreeDrawer';
import { Stage, StageResult } from '../Stage';


export class Tree extends Stage {

  type = 'tree';

  initialState = {
    color: 'gold',
    depth: '13',
    splitAngle: '25',
    splitVariation: '0.0',
    splitProbability: '0.9',
    lengthConservation: '0.8',
    lengthVariation: '1',
    seed: '0',
  };

  converter = {
    color: new ColorConverter('color'),
    depth: new NumberConverter('depth', { min: 0, max: 13, step: 1 }),
    splitAngle: new NumberConverter('splitAngle', { min: 0, max: 90, step: 1 }),
    splitVariation: new NumberConverter('splitVariation', { min: -1, max: 1, step: 0.05 }),
    splitProbability: new NumberConverter('splitProbability', { min: 0, max: 1, step: 0.05 }),
    lengthConservation: new NumberConverter('lengthConservation', { min: 0, max: 1, step: 0.05 }),
    lengthVariation: new NumberConverter('lengthVariation', { min: 0, max: 1, step: 0.05 }),
    seed: new NumberConverter('seed', { min: 0, max: 1000, step: 1 }),
  }

  generate = (config: TreeConfig, prev: StageResult) => {
    const size = [...new Array(config.depth).keys()].reduce((agg, n) => agg + Math.pow(config.lengthConservation, n), 0);
    return {
      grid: prev.grid,
      render: <TreeDrawer config={config} grid={prev.grid} />,
      boundingBox: {
        x: prev.boundingBox.x - size / 2,
        y: prev.boundingBox.y - size,
        w: prev.boundingBox.w + size,
        h: prev.boundingBox.h + size,
      },
    };
  }
}
