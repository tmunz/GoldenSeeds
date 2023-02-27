import React from 'react';

import { Toolbar } from '../domain/tools/Toolbar';
import { Editor } from '../domain/editor/Editor';
import { SvgCanvas } from '../domain/svg/SvgCanvas';
import { Config } from '../domain/config/Config';
import { Themer } from '../themer/Themer';
import { svgService } from '../domain/svg/SvgService';

import './GoldenSeedsView.styl';

type Props = {
  config?: Config;
  preconfigIndex?: number;
  editStageId?: string;
  svgContent?: string;
};

interface State {
  width: number;
  height: number;
}

export class GoldenSeedsView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...this.dimension,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', () => this.updateDimension());
    this.updateDimension();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => this.updateDimension());
  }

  render() {
    return (
      <div className="golden-seeds-view">
        <ErrorBoundary>
          {this.props.config && (
            <React.Fragment>
              <div
                className="canvas"
                style={{
                  left: this.props.editStageId !== null ? '52vw' : '50vw',
                }}
              >
                <SvgCanvas
                  svgContent={svgService.svgContent$.value}
                  config={this.props.config}
                />
              </div>
              <Editor
                editStageId={this.props.editStageId}
                config={this.props.config}
              />
            </React.Fragment>
          )}
          <Toolbar
            config={this.props.config}
            preconfigIndex={this.props.preconfigIndex}
            getSvg={() => this.props.svgContent}
          />
          <Themer />
        </ErrorBoundary>
      </div>
    );
  }

  private updateDimension() {
    this.setState(this.dimension);
    svgService.width = this.dimension.width * 1.04; // must be slightly larger, because of movement
    svgService.height = this.state.height;
    svgService.setSvgContent(
      this.dimension.width,
      this.dimension.height,
      this.props.config?.stages,
    );
  }

  private get dimension(): { width: number; height: number } {
    return { width: window.innerWidth, height: window.innerHeight };
  }
}

class ErrorBoundary extends React.Component<
  React.ComponentProps<any>,
  { error: boolean }
> {
  constructor(props: {}) {
    super(props);
    this.state = { error: false };
  }

  componentWillReceiveProps() {
    this.setState({ error: false });
  }

  componentDidCatch() {
    console.log('hier');
    this.setState({ error: true });
  }

  render() {
    if (this.state.error) {
      return (
        <React.Fragment>
          <div className="error">
            Something went wrong - this is currently the alpha version of v2.0;
            work in progress :-(
          </div>
          <a onClick={() => location.reload()}>continue</a>
        </React.Fragment>
      );
    } else {
      return this.props.children;
    }
  }
}
