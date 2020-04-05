import * as React from 'react';

import { Config } from './Config';
import { StageState } from './stage/Stage';
import { SvgGeneratorResult } from './generator/SvgGenerator';


interface Props {
  config: Config;
  width: number;
  height: number;
}

export class SvgCanvas extends React.Component<Props> {

  svgContent: SVGSVGElement;

  componentDidUpdate() {
    console.timeEnd('render')
  }

  render() {
    console.time('render')
    let prev: SvgGeneratorResult = {
      grid: [[0, 0]],
      svg: null,
      boundingBox: { x: 0, y: 0, w: 0, h: 0 }
    };
    const generatedStages = this.props.config.stages.map((stage) => {
      prev = stage.generator.generate(this.convertToValue(stage.state), prev);
      return prev;
    });

    return (
      <ErrorBoundary>
        <svg xmlns='http://www.w3.org/2000/svg'
          width={this.props.width}
          height={this.props.height}
          ref={e => this.svgContent = e}
        >
          {
            generatedStages.map((stageResult, i) => <g
              key={i}
              transform={this.transform(stageResult.boundingBox, 220)}
              dangerouslySetInnerHTML={{ __html: stageResult.svg }}
            />)
          }
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
