import * as React from 'react';

import { AnimationHelper } from '../helper/AnimationHelper';

import './DirectionSelector.styl';


export enum Direction {
  NONE, UP, DOWN, LEFT, RIGHT
}

interface Props {
  direction: Direction;
  onClick?: () => void;
  size?: number;
  className?: string;
}

interface State {
  points: number[][];
}

export class DirectionSelector extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = { points: DirectionSelector.getPoints(props.direction, props.size) };
  }

  static defaultProps = {
    size: 18
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.direction !== nextProps.direction) {
      this.animate(this.state.points, DirectionSelector.getPoints(nextProps.direction, nextProps.size));
    }
  }

  animate = (fromPoints: number[][], toPoints: number[][]) => {
    const durationMs = 600;
    const start = new Date().getTime();
    const animation = setInterval(() => {
      let t = (new Date().getTime() - start);
      let points = fromPoints.map((fromPoint, i) => [0, 1].map(c => AnimationHelper.easeInOut(fromPoints[i][c], toPoints[i][c], t, durationMs)));
      if (t < durationMs) {
        this.setState({ points });
      } else {
        this.setState({ points: toPoints });
        clearInterval(animation);
      }
    }, 40);
  }

  static toSvgPath(points: number[][]) {
    const p = (pnt: number[]) => ' ' + pnt[0] + ',' + pnt[1] + ' ';
    return 'M' + p(points[1]) + 'L' + p(points[0]) + 'M' + p(points[1]) + 'L' + p(points[2]);
  }

  static getPoints(direction: Direction, size: number) {
    let c = size / 2;
    let d0 = c - 2;
    let d1 = d0 / 3;
    let pC = [c, c];
    let p0 = [pC[0] + (direction === Direction.UP || direction === Direction.DOWN ? -d0 : 0), pC[1] + (direction === Direction.LEFT || direction === Direction.RIGHT ? -d0 : 0)];
    let p1 = [pC[0] + (direction === Direction.LEFT ? -d1 : direction === Direction.RIGHT ? d1 : 0), pC[1] + (direction === Direction.UP ? -d1 : direction === Direction.DOWN ? d1 : 0)];
    let p2 = [pC[0] + (direction === Direction.UP || direction === Direction.DOWN ? d0 : 0), pC[1] + (direction === Direction.LEFT || direction === Direction.RIGHT ? d0 : 0)];
    return [p0, p1, p2];
  }

  render() {
    return (
      <div
        className={["direction-selector", this.props.className ? this.props.className : ""].join(" ")}
        onClick={this.props.onClick}
      >
        <svg width={this.props.size} height={this.props.size}>
          <path className="indicator" d={DirectionSelector.toSvgPath(this.state.points)} />
        </svg>
      </div>
    );
  }
}