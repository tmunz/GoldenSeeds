import React from 'react';
import ReactCSSTransitionReplace from 'react-css-transition-replace';

import { Config } from '../config/Config';

import './SvgCanvas.styl';

interface Props {
  config: Config;
  svgContent?: string;
}

export function SvgCanvas(props: Props) {
  const DEBUG_MODE = false;
  return (
    <div className="svg-canvas">
      <ReactCSSTransitionReplace
        transitionName="cross-fade"
        transitionEnterTimeout={1000}
        transitionLeaveTimeout={1000}
      >
        {
          DEBUG_MODE
            ? <div
              key={props.config.stages.reduce((id, stage) => id + '_' + stage.id, '')}
              dangerouslySetInnerHTML={{ __html: props.svgContent ?? '' }}
            />
            : <img
              key={props.config.stages.reduce((id, stage) => id + '_' + stage.id, '')}
              src={`data:image/svg+xml;base64,${window.btoa(props.svgContent ?? '')}`}
            />
        }
      </ReactCSSTransitionReplace>
    </div>
  );

}
