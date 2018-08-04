import * as React from 'react';

import { DrawConfig } from '../datatypes/DrawConfig';


export interface Props {
  itemPositions: number[][],
  config: DrawConfig,
  scale: number,
}

export class AbstractDrawer extends React.Component<Props> {

  isSamePosition = (pA: number[], pB: number[]) => [0, 1].reduce((b, c) =>
    b && pA && pB && Math.abs(pA[c] - pB[c]) < 0.0001 /*tolerance*/, true);

}