import * as React from 'react';

import { Color } from '../../../datatypes/Color';


export interface TreeConfig {
  color: Color;
  depth: number;
  variation: number;
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
    const color = this.props.config.color.toString(0);
    return <rect x={0} y={0} width={1} height={1} stroke={color} strokeWidth={1} vectorEffect='non-scaling-stroke' />;
  }
}
