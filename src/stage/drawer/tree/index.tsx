import React from 'react';

import { Drawer } from '../Drawer';
import { NumberConverter, ColorConverter } from '../../../converter';
import { TreeConfig, TreeDrawer } from './TreeDrawer';


export class Tree extends Drawer {

  type = 'tree';

  initialState = {
    color: 'gold',
    depth: '4',
    variation: '0',
  };

  converter = {
    color: new ColorConverter('color'),
    depth: new NumberConverter('depth', { min: 0, max: 10, step: 1 }),
    variation: new NumberConverter('variation', { min: 0, max: 0.05, step: 1 }),
  };

  generate = (config: TreeConfig, grid: { result: number[][]; boundingBox: BoundingBox }) => {
    return {
      result: <TreeDrawer config={config} grid={grid.result} />,
      boundingBox: {
        x: grid.boundingBox.x - config.depth / 2,
        y: grid.boundingBox.y - config.depth / 2,
        w: grid.boundingBox.w + config.depth,
        h: grid.boundingBox.h + config.depth,
      },
    };
  }
}
