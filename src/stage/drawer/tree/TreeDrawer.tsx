import * as React from 'react';

import { Color } from '../../../datatypes/Color';


export interface TreeConfig {
  color: Color;
  depth: number;
  splitAngle: number;
  splitVariation: number;
  splitProbability: number;
  lengthConservation: number;
  lengthVariation: number;
}

export interface Props {
  config: TreeConfig;
  grid: number[][];
}


export class TreeDrawer extends React.Component<Props> {

  constructor(props: Props) {
    super(props);
  }

  render() {
    const tree = this.calculateTree();
    const color = this.props.config.color.toString(0);
    const depth = this.props.config.depth;
    return this.props.grid.map(p => (
      <rect
        x={p[0] - depth / 2}
        y={p[1] - depth / 2}
        width={depth}
        height={depth}
        stroke={color}
        strokeWidth={1}
        vectorEffect='non-scaling-stroke'
      />
    ));
  }

  private calculateTree() {
    let root = { x: this.props.config.depth / 2, y: 0, angle: 90 };
    let lines: {a: Point, b: Point}[] = [];
    return root;
  }
}
