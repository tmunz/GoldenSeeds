import React from 'react';

import { MathUtils } from '../../../../utils/MathUtils';
import { TreeConfig, TreeDrawer } from './TreeDrawer';
import { Stage, StageResult } from '../../Stage';


export class Tree extends Stage {

  static type = 'tree';
  type = Tree.type;

  definition = {
    color: { initial: 'gold', type: 'color' as const },
    depth: { initial: '13', type: { name: 'number' as const, min: 0, max: MathUtils.fib(6), step: 1 } },
    splitAngle: { initial: '25', type: { name: 'number' as const, min: 0, max: 90, step: 1 } },
    splitVariation: { initial: '0.0', type: { name: 'number' as const, min: -1, max: 1, step: 0.05 } },
    splitProbability: { initial: '0.9', type: { name: 'number' as const, min: 0, max: 1, step: 0.05 } },
    lengthConservation: { initial: '0.8', type: { name: 'number' as const, min: 0, max: 1, step: 0.05 } },
    lengthVariation: { initial: '1', type: { name: 'number' as const, min: 0, max: 1, step: 0.05 } },
    seed: { initial: '0', type: { name: 'number' as const, min: 0, max: 1000, step: 1 } },
  };

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
