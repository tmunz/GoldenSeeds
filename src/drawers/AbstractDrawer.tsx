import * as React from 'react';

import { DrawConfig, DrawStyle } from '../datatypes/DrawConfig';


export interface Props {
  itemPositions: number[][],
  config: DrawConfig,
  scale: number,
}

export abstract class AbstractDrawer extends React.Component<Props> {

  abstract createElements(): JSX.Element[];

  isSamePosition = (pA: number[], pB: number[]) => [0, 1].reduce((b, c) =>
    b && pA && pB && Math.abs(pA[c] - pB[c]) < 0.0001 /*tolerance*/, true);

  render() {
    let elements: JSX.Element[] = this.createElements();

    return <g>{
      elements.map((e: JSX.Element, i) => {
        let itemColor = this.props.config.itemColor.toString();
        return {
          ...e, key: i, props: {
            ...e.props,
            ...(this.props.config.style === DrawStyle.FILLED ? { fill: itemColor } : { fill: 'none', stroke: itemColor, strokeWidth: 1 }),
            id: `item-${i}`,
          }
        }
      })
    }</g>
  }
}