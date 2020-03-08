import React from "react";
import { MathUtils } from "../utils/MathUtils";
import { AnimationUtils } from "../utils/AnimationUtils";
import { DirectionButton, Direction } from "../ui/DirectionButton";

interface Props {
  target: number;
  onNewFrame: (n: number) => void;
}

interface State {
  current: number;
}

export class AnimationController extends React.Component<Props, State> {

  private static START_VALUE = 0;
  private static INTERVAL = 40;

  private animation: any; // Interval

  constructor(props: Props) {
    super(props);
    this.state = {
      current: undefined,
    }
  }

  render() {
    const currentlyAnimating = typeof this.state.current !== "undefined";
    return (
      <a
        className={currentlyAnimating ? "active" : ""}
        target="_blank"
        onClick={() => this.animate()}
      >
        <DirectionButton direction={Direction.RIGHT} title="animate"/>
        {/* currentlyAnimating && this.state.current */}
      </a>
    );
  }

  animate = () => {
    const doesNotInterfereWithRunningAnimation = typeof this.state.current === "undefined";

    if (doesNotInterfereWithRunningAnimation) {
      const target = this.props.target;
      const start = new Date().getTime();
      this.animation = setInterval(() => {
        const frame = (new Date().getTime() - start) / AnimationController.INTERVAL;
        const duration = MathUtils.goldenRatio * AnimationController.INTERVAL;
        const raw = AnimationUtils.easeInOut(AnimationController.START_VALUE, target, frame, duration);
        const current: number = Math.max(0, Math.min(target, Math.round(raw)));
        this.props.onNewFrame(current);
        let isComplete = current >= target;
        this.setState({ current: isComplete ? undefined : current });
        if (isComplete) {
          clearInterval(this.animation);
        }
      }, AnimationController.INTERVAL);
    }
  }
}
