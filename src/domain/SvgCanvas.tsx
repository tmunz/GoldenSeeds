import React from 'react';

import { Config } from './Config';
import { SvgGeneratorResult } from './generator/SvgGenerator';
import { svgGeneratorService } from './generator/SvgGeneratorService';

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
            key={i}
            className={this.props.config.stages[i].generator.type}
            transform={this.transform(stageResult.boundingBox, 200)}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )
      );
    });

    return (
      <ErrorBoundary>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={this.props.width}
          height={this.props.height}
          ref={(e) => (this.svgContent = e)}
        >
          {content}
        </svg>
      </ErrorBoundary>
    );
  }

  private transform(boundingBox: BoundingBox, offset = 0): string {
    const targetSize = Math.min(this.props.width, this.props.height) - offset;
    const scale = targetSize / Math.max(boundingBox.w, boundingBox.h);
    const x =
      this.props.width / 2 - (boundingBox.x + boundingBox.w / 2) * scale;
    const y =
      this.props.height / 2 - (boundingBox.y + boundingBox.h / 2) * scale;
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
