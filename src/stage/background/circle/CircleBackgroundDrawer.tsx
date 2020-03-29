import React, { Component } from "react";

import { Color } from "../../../datatypes/Color";

export class CircleBackgroundDrawer extends Component<{ config: { color: Color } }> {

  render() {
    return <circle r={1 / 2} cx={0} cy={0} fill={this.props.config.color.toString()} />;
  }
}