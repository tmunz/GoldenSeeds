import React from 'react';

import { preconfigService } from '../preconfig/PreconfigService';
import { RawConfig } from '../config/RawConfig';

import './PreconfigSelector.styl';


interface Props {
  preconfigs?: { name: string; rawConfig: RawConfig; svg: string; }[];
  selectedPreconfig?: string;
}

export function PreconfigSelector(props: Props) {

  return (
    <div className="preconfig-selector">
      <div>{/*props.selectedPreconfig*/}</div>
      <div>
        {props.preconfigs?.map((preconfig) => (
          <div className="preconfig-item" key={preconfig.name}>
            <a onClick={() => preconfigService.selectPreconfigByName(preconfig.name)}>
              {preconfig.name}
              <img className="preview" src={`data:image/svg+xml;base64,${window.btoa(preconfig.svg)}`} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
