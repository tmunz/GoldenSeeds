import React from 'react';

import { AnimatedIcon } from './AnimatedIcon';
import { ArrowFlat, ArrowRegular, ArrowNone } from './icon/Arrow';

import './AnimatedButton.styl';

interface Props {
  title?: string;
  iconText?: string;
  rotation?: number;
  disabled?: boolean;
  onClick?: () => void;
  points?: number[][][];
}

interface State {
  hover: boolean;
}

export class AnimatedButton extends React.Component<Props, State> {
  static DIRECTION_UP = 180;
  static DIRECTION_DOWN = 0;
  static DIRECTION_LEFT = 90;
  static DIRECTION_RIGHT = 270;

  constructor(props: Props) {
    super(props);
    this.state = { hover: false };
  }

  render() {
    return (
      <div
        className={['animated-button', this.state.hover ? 'hover' : ''].join(' ')}
        onClick={() => this.props.onClick && this.props.onClick()}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
      >
        <div className="tooltip">{this.props.title}</div>
        <div className="icon-text">{this.props.iconText}</div>
        <AnimatedIcon
          points={this.props.points ?? [ArrowNone, ArrowFlat, ArrowRegular]}
          index={this.props.disabled ? 0 : this.state.hover ? 2 : 1}
          rotation={this.props.rotation ?? 0}
        />
      </div>
    );
  }
}
