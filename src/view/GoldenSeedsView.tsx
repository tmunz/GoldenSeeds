import * as React from 'react';

import { Toolbar } from '../tools/Toolbar';
import { Editor } from '../editor/Editor';
import { Themer } from '../themer/Themer';
import { SvgCanvas } from './SvgCanvas';
import { Config } from '../Config';

import './GoldenSeedsView.styl';


type Props = {
  config: Config;
  preconfigIndex: number;
  editStageId: number;
}

interface State {
  width: number;
  height: number;
}

export class GoldenSeedsView extends React.Component<Props, State> {

  private svgCanvas: SvgCanvas;

  constructor(props: Props) {
    super(props);
    this.state = {
      ...this.dimension,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', () => this.updateDimension());
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => this.updateDimension());
  }

  render() {
    return (
      <div className="golden-seeds-view">
        {
          this.props.config && <React.Fragment>
            <div className="canvas" style={{ left: (this.props.editStageId !== null ? '52vw' : '50vw') }}>
              <SvgCanvas
                ref={e => this.svgCanvas = e}
                config={this.props.config}
                width={this.state.width * 1.04}
                height={this.state.height}
              />
            </div>
            <Editor
              editStageId={this.props.editStageId}
              config={this.props.config}
            />
          </React.Fragment>
        }
        <Toolbar
          config={this.props.config}
          preconfigIndex={this.props.preconfigIndex}
          getSvg={() => this.svgCanvas ? this.svgCanvas.svgContent : undefined}
        />
        <Themer />
      </div>
    );
  }

  private updateDimension() {
    this.setState(this.dimension);
  }

  private get dimension(): { width: number; height: number } {
    return { width: window.innerWidth, height: window.innerHeight };
  }
}
