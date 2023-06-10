import React from 'react';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { PlayNone, PlayRegular, PlayFlipped } from '../../ui/icon/Play';
import { animationService } from '../animation/AnimationService';

interface Props {
  stageId: string;
  groupId: string;
  id: string;
  value: number;
  currentlyAnimating: boolean;
}

export class AnimationController extends React.Component<Props> {
  render() {
    return (
      <AnimatedButton
        title="play"
        points={[PlayNone, PlayRegular, PlayFlipped]}
        iconText={this.props.currentlyAnimating ? '' + this.props.value : undefined}
        className={this.props.currentlyAnimating ? 'active' : ''}
        onClick={() =>
          animationService.animate(this.props.stageId, this.props.groupId, this.props.id, this.props.value)
        }
      />
    );
  }
}
