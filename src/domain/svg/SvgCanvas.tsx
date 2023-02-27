import React from 'react';
import ReactCSSTransitionReplace from 'react-css-transition-replace';

import { Config } from '../config/Config';

import './SvgCanvas.styl';

interface Props {
  config: Config;
  svgContent: string;
}

export class SvgCanvas extends React.Component<Props> {
  render() {
    return (
      <div className="svg-canvas">
        <ReactCSSTransitionReplace
          transitionName="cross-fade"
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={1000}
        >
          <div
            className="svg-canvas-wrapper"
            key={this.props.config.stages.reduce(
              (id, stage) => id + '_' + stage.id,
              '',
            )}
            dangerouslySetInnerHTML={{ __html: this.props.svgContent ?? '' }}
          />
        </ReactCSSTransitionReplace>
      </div>
    );
  }
}
