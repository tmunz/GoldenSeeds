import React from 'react';

import { preconfigService } from '../preconfig/PreconfigService';
import { RawConfig } from '../config/RawConfig';
import { AnimatedButton } from '../../ui/AnimatedButton';

import './PreconfigSelector.styl';


interface Props {
  preconfigs?: { name: string; rawConfig: RawConfig; svg: string; }[];
  selectedPreconfig?: string;
}

export function PreconfigSelector(props: Props) {
  let preconfigs = props.preconfigs ?? [];
  let selectedIndex = preconfigs.findIndex(p => p.name === props.selectedPreconfig);
  const count = preconfigs.length;
  preconfigs = [...preconfigs, ...preconfigs, ...preconfigs];
  selectedIndex = count + (selectedIndex < 0 ? 0 : selectedIndex);
  const visibleAroundCount = Math.min((count - 1) / 2, 3);
  const visiblePreconfigs = preconfigs.slice(selectedIndex - Math.floor(visibleAroundCount), selectedIndex + Math.ceil(visibleAroundCount) + 1);

  return (
    <div className="preconfig-selector">
      <div className="preconfig-prev">
        <AnimatedButton
          rotation={AnimatedButton.DIRECTION_LEFT}
          onClick={() => preconfigService.selectNext(-1)}
        />
      </div>
      <div className="preconfig-overview">
        {visiblePreconfigs.map((preconfig) => (
          <div className="preconfig-item" key={preconfig.name}>
            <a onClick={() => preconfigService.selectByName(preconfig.name)}>
              {preconfig.name}
              <img className="preview" src={`data:image/svg+xml;base64,${window.btoa(preconfig.svg)}`} />
            </a>
          </div>
        ))}
      </div>
      <div className="preconfig-next">
        <AnimatedButton
          rotation={AnimatedButton.DIRECTION_RIGHT}
          onClick={() => preconfigService.selectNext(+1)}
        />
      </div>
    </div>
  );
}
