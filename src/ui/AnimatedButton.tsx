import React from 'react';

import { AnimatedIcon } from './AnimatedIcon';
import { ArrowFlat, ArrowRegular, ArrowNone } from './icon/Arrow';

import './AnimatedButton.styl';

interface Props {
  title?: string;
  iconText?: string;
  rotation?: number;
  disabled?: boolean;
  onClick?: (active?: boolean) => void;
  points?: number[][][];
  useAsToggle?: boolean;
}

interface State {
  active: boolean;
}

export class AnimatedButton extends React.Component<Props, State> {
  static DIRECTION_UP = 180;
  static DIRECTION_DOWN = 0;
  static DIRECTION_LEFT = 90;
  static DIRECTION_RIGHT = 270;

  constructor(props: Props) {
    super(props);
    this.state = { active: false };
  }

  render() {
    return (
      <div
        className={['animated-button', this.state.active ? 'active' : ''].join(' ')}
        onClick={() => this.handleClick()}
      >
        <div className="tooltip">{this.props.title}</div>
        <div className="icon-text">{this.props.iconText}</div>
        <AnimatedIcon
          points={this.props.points ?? [ArrowNone, ArrowFlat, ArrowRegular]}
          index={this.props.disabled ? 0 : this.state.active ? 2 : 1}
          rotation={this.props.rotation ?? 0}
        />
      </div>
    );
  }

  handleClick(): void {
    this.setState(state => {
      return { active: !state.active };
    }, () => {
      const active = this.state.active;
      this.props.onClick && this.props.onClick(active);
      if (!this.props.useAsToggle) {
        setTimeout(() => this.setState({ active: !active }), 500);
      }
    });
  }
}
