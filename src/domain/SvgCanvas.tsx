import React from 'react';
import ReactCSSTransitionReplace from 'react-css-transition-replace';

import { Config } from './Config';
import { SvgGeneratorResult } from './generator/SvgGenerator';
import { svgGeneratorService } from './generator/SvgGeneratorService';

import './SvgCanvas.styl';

interface Props {
  config: Config;
  width: number;
  height: number;
}

export class SvgCanvas extends React.Component<Props> {
  svgContent: SVGSVGElement | null = null;

  render() {
    const generatedStages: SvgGeneratorResult[] = [];
    this.props.config.stages.forEach((stage, i) =>
      generatedStages.push(svgGeneratorService.getResult(stage, generatedStages[i - 1]))
    );

    const content = generatedStages.map((stageResult, i) => {
      const svg = stageResult.svg;
      return (
        typeof svg === 'string' && (
          <g
            key={this.props.config.stages[i].id}
            className={this.props.config.stages[i].generator.type}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )
      );
    });

    return (
      <ErrorBoundary>
        <div className="svg-canvas">
          <ReactCSSTransitionReplace
            transitionName="cross-fade"
            transitionEnterTimeout={1000}
            transitionLeaveTimeout={1000}
          >
            <div 
              className="svg-canvas-wrapper" 
              key={this.props.config.stages.reduce((id, stage) => id + '_' + stage.id, '')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={this.props.width}
                height={this.props.height}
                ref={(e) => (this.svgContent = e)}
              >
                <g
                  transform={this.centerAndScale(this.boundingBox(generatedStages), 200)}
                >
                  {content}
                </g>
              </svg>
            </div>
          </ReactCSSTransitionReplace>
        </div>
      </ErrorBoundary>
    );
  }

  private boundingBox(generatedStages: SvgGeneratorResult[]): BoundingBox {
    const extremePoints = generatedStages.reduce((b, stage) => ({
      x1: Math.min(stage.boundingBox.x, b.x1),
      y1: Math.min(stage.boundingBox.y, b.y1),
      x2: Math.max(stage.boundingBox.x + stage.boundingBox.w, b.x2),
      y2: Math.max(stage.boundingBox.y + stage.boundingBox.h, b.y2),
    }), { x1: 0, y1: 0, x2: 0, y2: 0 });
    return {
      x: extremePoints.x1,
      y: extremePoints.y1,
      w: extremePoints.x2 - extremePoints.x1,
      h: extremePoints.y2 - extremePoints.y1,
    }
  }

  private centerAndScale(boundingBox: BoundingBox, offset = 0): string {
    const targetSize = Math.min(this.props.width, this.props.height) - offset;
    const scale = targetSize / Math.max(boundingBox.w, boundingBox.h);
    const x = this.props.width / 2 - (boundingBox.x + boundingBox.w / 2) * scale;
    const y = this.props.height / 2 - (boundingBox.y + boundingBox.h / 2) * scale;
    return `translate(${isFinite(x) ? x : 0},${isFinite(y) ? y : 0}) scale(${
      isFinite(scale) ? scale : 1
      })`;
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
      return (
        <div className="error">Something went wrong - work in progress :-(</div>
      );
    }
    return this.props.children;
  }
}
