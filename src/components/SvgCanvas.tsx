import * as React from 'react';

import { DrawConfig, DrawType } from '../datatypes/DrawConfig';
import { RegularShapeDrawer } from '../drawers/RegularShapeDrawer';
import { Props as DrawerProps } from '../drawers/AbstractDrawer';


interface Props {
  config: DrawConfig,
  scale: number,
  width: number,
  height: number,
}

interface State {
}

export class SvgCanvas extends React.Component<Props, State> {

  svgContent: SVGSVGElement;
  itemPositions: number[][] = [];

  constructor(props: Props) {
    super(props);
    this.state = {};
    this.updateItemPositions(props);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.config.items !== nextProps.config.items
      || this.props.config.angle !== nextProps.config.angle
      || this.props.config.distance !== nextProps.config.distance
      || this.props.scale !== nextProps.scale
      || this.props.width !== nextProps.width
      || this.props.height !== nextProps.height
    ) {
      this.updateItemPositions(nextProps);
    }
  }

  updateItemPositions(props: Props) {
    this.itemPositions = [];
    for (let n = 1; n <= props.config.items; n++) {
      let rad = props.config.angle(n) / 180 * Math.PI;
      this.itemPositions.push([Math.cos(rad), Math.sin(rad)].map((trig, i) =>
        (i === 0 ? props.width : props.height) / 2 + props.scale * props.config.distance(n) * trig));
    }
  }

  create() {
    let props: DrawerProps = { itemPositions: this.itemPositions, config: this.props.config, scale: this.props.scale };
    switch (this.props.config.type) {
      case DrawType.REGULAR_SHAPE:
      default:
        return <RegularShapeDrawer {...props} />
    }
  }

  render() {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={this.props.width} height={this.props.height} ref={e => this.svgContent = e}>
        <circle
          r={this.props.config.size / 2 + 10}
          cx={this.props.width / 2}
          cy={this.props.height / 2}
          fill={this.props.config.backgroundColor.toString()}
        />
        {this.props.scale !== 0 && isFinite(this.props.scale) && this.create()}
      </svg>
    );
  }
}