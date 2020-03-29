import React from 'react';

import { NumberConverter, ExpressionConverter, ListConverter, ColorConverter } from '../../converter';
import { MathUtils } from '../../utils/MathUtils';
import { RegularShapeDrawer, RegularShapeConfig } from './RegularShapeDrawer';
import { DrawStyle } from '../../datatypes/DrawStyle';
import { Stage, StageResult } from '../Stage';


export class RegularShape extends Stage {

  type = 'regular-shape';

  initialState = {
    color: 'gold',
    style: 'stroke',
    corners: '0',
    angle: '0',
    size: '1',
    ratio: '0.5',
    cutRatio0: '0',
    cutRatio1: '0',
  }

  converter = {
    color: new ColorConverter('color'),
    style: new ListConverter<DrawStyle>('style', [DrawStyle.FILLED, DrawStyle.STROKE]),
    corners: new NumberConverter('corners', { min: 0, max: MathUtils.fib(8), step: 1 }),
    angle: new ExpressionConverter('angle', { min: 0, max: 360, step: 1 }),
    size: new ExpressionConverter('size', { min: 0.5, max: 10, step: 0.05 }),
    ratio: new ExpressionConverter('ratio', { min: 0, max: 2, step: 0.05 }),
    cutRatio0: new ExpressionConverter('cutRatio0', { min: 0, max: 1, step: 0.05 }),
    cutRatio1: new ExpressionConverter('cutRatio1', { min: 0, max: 1, step: 0.05 }),
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
