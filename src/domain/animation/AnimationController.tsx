import React from 'react';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { PlayNone, PlayRegular, PlayFlipped } from '../../ui/icon/Play';
import { animationService } from '../animation/AnimationService';

export function AnimationController(props: {
  stageId: string;
  groupId: string;
  id: string;
  value: number;
  currentlyAnimating: boolean;
}) {
  return (
    <AnimatedButton
      title="play"
      points={[PlayNone, PlayRegular, PlayFlipped]}
      iconText={props.currentlyAnimating ? '' + props.value : undefined}
      className={props.currentlyAnimating ? 'active' : ''}
      onClick={() =>
        animationService.animate(props.stageId, props.groupId, props.id, props.value)
      }
    />
  );
}
