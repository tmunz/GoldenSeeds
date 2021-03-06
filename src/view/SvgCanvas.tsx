import * as React from 'react';

import { Config, StageState } from '../Config';


interface Props {
  config: Config;
  width: number;
  height: number;
}

export class SvgCanvas extends React.Component<Props> {

  svgContent: SVGSVGElement;

  render() {
    const grid = this.props.config.grid.generate(this.convertToValue(this.props.config.grid.state));
    const drawing = this.props.config.drawer.generate(this.convertToValue(this.props.config.drawer.state), grid);
    const background = this.props.config.background.generate(this.convertToValue(this.props.config.background.state));

    return (
      <ErrorBoundary>
        <svg xmlns='http://www.w3.org/2000/svg'
          width={this.props.width}
          height={this.props.height}
          ref={e => this.svgContent = e}
        >
          <defs>
            <g id='background'>{background.result}</g>
            <g id='drawing'>{drawing.result}</g>
          </defs>
          <use transform={this.transform(background.boundingBox, 200)} href='#background' />
          <use transform={this.transform(drawing.boundingBox, 220)} href='#drawing' />
        </svg>
      </ErrorBoundary>
    );
  }

  private transform(boundingBox: BoundingBox, offset = 0): string {
    const targetSize = Math.min(this.props.width, this.props.height) - offset;
    const scale = targetSize / Math.max(boundingBox.w, boundingBox.h);
    const x = (this.props.width / 2 - (boundingBox.x + boundingBox.w / 2) * scale);
    const y = (this.props.height / 2 - (boundingBox.y + boundingBox.h / 2) * scale);
    return `translate(${x},${y}) scale(${scale})`;
  }

  private convertToValue(obj: { [key: string]: StageState<any> }): { [key: string]: any } {
    return Object.keys(obj).reduce((agg, key) => ({ ...agg, [key]: obj[key].value }), {});
  }
}


class ErrorBoundary extends React.Component<{}, { error: boolean }> {
  constructor(props: {}) {
    super(props);
    this.state = { error: false };
  }

  componentWillReceiveProps() {
    this.setState({ error: false });
  }

  componentDidCatch() {
    this.setState({ error: true });
  }

  render() {
    if (this.state.error) {
      return <div className='error'>Something went wrong - work in progress :-(</div>;
    }
    return this.props.children;
  }
}
