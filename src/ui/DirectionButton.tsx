import React from 'react';

import { AnimatedIcon } from './AnimatedIcon';
import { ArrowFlat } from './svg/ArrowFlat';
import { ArrowRegular } from './svg/ArrowRegular';
import { ArrowNone } from './svg/ArrowNone';

import './DirectionButton.styl';

export enum Direction {
  UP = 180,
  DOWN = 0,
  LEFT = 90,
  RIGHT = 270,
}

interface Props {
  title: string;
  iconText?: string;
  direction: Direction;
  disabled?: boolean;
  onClick?: () => void;
}

interface State {
  hover: boolean;
}

export class DirectionButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hover: false };
  }

  render() {
    return (
      <div
        className={['direction-button', this.state.hover ? 'hover' : ''].join(
          ' ',
        )}
        onClick={() => this.props.onClick && this.props.onClick()}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
      >
        <div className="tooltip">{this.props.title}</div>
        <div className="icon-text">{this.props.iconText}</div>
        <AnimatedIcon
          points={[ArrowNone, ArrowFlat, ArrowRegular]}
          index={this.props.disabled ? 0 : this.state.hover ? 2 : 1}
          rotation={this.props.direction}
        />
      </div>
    );
  }
}
