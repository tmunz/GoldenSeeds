import React from 'react';
import { AnimationUtils } from '../../utils/AnimationUtils';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { PlayNone } from '../../ui/svg/PlayNone';
import { PlayRegular } from '../../ui/svg/PlayRegular';
import { PlayFlipped } from '../../ui/svg/PlayFlipped';

interface Props {
  target: number;
  onNewFrame: (n: number) => void;
}

interface State {
  current?: number;
}

export class AnimationController extends React.Component<Props, State> {
  private static START_VALUE = 0;
  private static INTERVAL = 40;

  private animation: any; // Interval

  constructor(props: Props) {
    super(props);
    this.state = {
      current: undefined,
    };
  }

  render() {
    const currentlyAnimating = typeof this.state.current !== 'undefined';
    return (
      <a
        className={currentlyAnimating ? 'active' : ''}
        target="_blank"
        onClick={() => this.animate()}
      >
        <AnimatedButton  
          title="play" 
          points={[PlayNone, PlayRegular, PlayFlipped]}
          iconText={ currentlyAnimating ? ("" + this.state.current) : undefined }
        />
      </a>
    );
  }

  animate = () => {
    const doesNotInterfereWithRunningAnimation =
      typeof this.state.current === 'undefined';

    if (doesNotInterfereWithRunningAnimation) {
      const target = this.props.target;
      const start = new Date().getTime();
      this.animation = setInterval(() => {
        const frame = (new Date().getTime() - start) / AnimationController.INTERVAL;
        const raw = AnimationUtils.easeInOut(
          AnimationController.START_VALUE,
          target,
          frame,
          100,
        );
        const current: number = Math.max(0, Math.min(target, Math.round(raw)));
        this.props.onNewFrame(current);
        const isComplete = current >= target;
        this.setState({ current: isComplete ? undefined : current });
        if (isComplete) {
          clearInterval(this.animation);
        }
      }, AnimationController.INTERVAL);
    }
  };
}
