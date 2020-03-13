import * as React from 'react';

import { Color } from '../../../datatypes/Color';
import { Tree, Config as TreeImplConfig } from './Tree';


export interface TreeConfig extends TreeImplConfig {
  color: Color;
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
    const tree = new Tree(this.props.config);
    const color = this.props.config.color.toString(0);
    const depth = this.props.config.depth;
    return this.props.grid.map((p, i) => (
      <g key={i}>
        {tree.limbs.map((limb, j) => (
          <line
            key={j}
            x1={p[0] + limb.from.x}
            y1={p[1] + depth/2 - limb.from.y}
            x2={p[0] + limb.to.x}
            y2={p[1] + depth/2 - limb.to.y}
            stroke={color}
            strokeWidth={1}
            vectorEffect='non-scaling-stroke'
          />
        ))}
      </g>
    ));
  }
}
