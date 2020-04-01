import * as React from 'react';

import { Color } from '../../../../datatypes/Color';
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
    return this.props.grid.map((p, i) => {
      const tree = new Tree({ ...this.props.config, seed: this.props.config.seed + i });
      const color = this.props.config.color.toString(i);
      return <g key={i}>
        {tree.limbs.map((limb, j) => (
          <line
            key={j}
            x1={p[0] + limb.from.x}
            y1={p[1] - limb.from.y}
            x2={p[0] + limb.to.x}
            y2={p[1] - limb.to.y}
            stroke={color}
            strokeWidth={Math.pow(this.props.config.lengthConservation, limb.level) * 5}
            vectorEffect='non-scaling-stroke'
          />
        ))}
      </g>
    });
  };
}
