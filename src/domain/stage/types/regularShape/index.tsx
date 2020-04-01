import React from 'react';

import { DrawStyle } from '../../../../datatypes/DrawStyle';
import { MathUtils } from '../../../../utils/MathUtils';
import { RegularShapeDrawer, RegularShapeConfig } from './RegularShapeDrawer';
import { Stage, StageResult } from '../../Stage';


export class RegularShape extends Stage {

  static type = 'regular-shape';
  type = RegularShape.type;

  definition = {
    color: { initial: 'gold', type: 'color' as const },
    style: { initial: DrawStyle.STROKE, type: { name: 'selection' as const, options: [DrawStyle.FILLED, DrawStyle.STROKE] } },
    corners: { initial: '0', type: { name: 'number' as const, min: 0, max: MathUtils.fib(8), step: 1 } },
    angle: { initial: '0', type: { name: 'expression' as const, min: 0, max: 360, step: 1 } },
    size: { initial: '1', type: { name: 'expression' as const, min: 0, max: 2, step: 0.05 } },
    ratio: { initial: '1', type: { name: 'expression' as const, min: 0, max: 2, step: 0.05 } },
    cutRatio0: { initial: '0', type: { name: 'expression' as const, min: 0, max: 1, step: 0.05 } },
    cutRatio1: { initial: '0', type: { name: 'expression' as const, min: 0, max: 1, step: 0.05 } },
  };

  generate = (config: RegularShapeConfig, prev: StageResult) => {
    const items = prev.grid.length;
    const itemsSize = config.size(items, items);
    return {
      grid: prev.grid,
      render: <RegularShapeDrawer config={config} grid={prev.grid} />,
      boundingBox: {
        x: prev.boundingBox.x - itemsSize / 2,
        y: prev.boundingBox.y - itemsSize / 2,
        w: prev.boundingBox.w + itemsSize,
        h: prev.boundingBox.h + itemsSize,
      },
    };
  };

}
