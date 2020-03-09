import React from 'react';

import { Drawer } from '../Drawer';
import { NumberConverter, ExpressionConverter, ListConverter, ColorConverter } from '../../../converter';
import { MathUtils } from '../../../utils/MathUtils';
import { RegularShapeDrawer, RegularShapeConfig } from './RegularShapeDrawer';
import { DrawStyle } from '../../../datatypes/DrawStyle';


export class RegularShape extends Drawer {

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

  generate = (config: RegularShapeConfig, grid: { result: number[][]; boundingBox: BoundingBox }) => {
    const items = grid.result.length;
    const itemsSize = config.size(items, items);
    return {
      result: <RegularShapeDrawer config={config} grid={grid.result} />,
      boundingBox: {
        x: grid.boundingBox.x - itemsSize / 2,
        y: grid.boundingBox.y - itemsSize / 2,
        w: grid.boundingBox.w + itemsSize,
        h: grid.boundingBox.h + itemsSize,
      },
    };
  };

}
