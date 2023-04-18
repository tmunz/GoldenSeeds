import React, { useState, useEffect } from 'react';

import { preconfigService } from '../preconfig/PreconfigService';
import { RawConfig } from '../config/RawConfig';

interface Props {
  selectedPreconfig?: string;
}

export function PreconfigSelector(props: Props) {

  const [preconfigs, setPreconfigs] = useState<{ name: string, rawConfig: RawConfig }[]>([]);

  useEffect(() => {
    (async () => {
      setPreconfigs(await preconfigService.list());
    })();
  }, []);

  return (
    <div>
      <div>{props.selectedPreconfig}</div>
      <div>
        {preconfigs.map((preconfig) => (
          <div key={preconfig.name}>
            <a onClick={() => preconfigService.selectPreconfigByName(preconfig.name)}>{preconfig.name}</a>
          </div>
        ))}
      </div>
    </div>
  );
}
