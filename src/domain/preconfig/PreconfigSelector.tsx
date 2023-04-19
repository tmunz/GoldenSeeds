import React from 'react';

import { preconfigService } from '../preconfig/PreconfigService';
import { RawConfig } from '../config/RawConfig';

interface Props {
  preconfigs?: { name: string; rawConfig: RawConfig; svg: string; }[];
  selectedPreconfig?: string;
}

export function PreconfigSelector(props: Props) {

  return (
    <div>
      <div>{/*props.selectedPreconfig*/}</div>
      <div>
        {props.preconfigs?.map((preconfig) => (
          <div key={preconfig.name}>
            <a onClick={() => preconfigService.selectPreconfigByName(preconfig.name)}>
              {preconfig.name}
              <div dangerouslySetInnerHTML={{ __html: preconfig.svg }} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
