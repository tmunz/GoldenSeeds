import React from 'react';
import ReactCSSTransitionReplace from 'react-css-transition-replace';

import { Config } from '../config/Config';

import './SvgCanvas.styl';

interface Props {
  config: Config;
  svgContent?: string;
}

export function SvgCanvas(props: Props) {
  const key = props.config.stages.reduce((id, stage) => id + '_' + stage.id, '');
  const svgContent = props.svgContent ?? '';
  return (
    <div className="svg-canvas">
      <ReactCSSTransitionReplace
        transitionName="cross-fade"
        transitionEnterTimeout={1000}
        transitionLeaveTimeout={1000}
      >
        {process.env.MODE === 'production' ? (
          <img key={key} src={`data:image/svg+xml;base64,${window.btoa(svgContent)}`} />
        ) : (
          <div key={key} dangerouslySetInnerHTML={{ __html: svgContent }} />
        )}
      </ReactCSSTransitionReplace>
    </div>
  );
}
