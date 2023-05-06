import React, { useState, useEffect } from 'react';
import { first, filter } from 'rxjs/operators';

import { GoldenSeedsView } from './view/GoldenSeedsView';
import { preconfigService } from './domain/preconfig/PreconfigService';
import { Config } from './domain/config/Config';
import { animationService } from './domain/animation/AnimationService';
import { configService } from './domain/config/ConfigService';
import { preconfigs as predefinedConfigs } from './domain/preconfig/data';
import { RawConfig } from './domain/config/RawConfig';
import { fontService } from './domain/font/FontService';

export function App() {
  const [preconfigs, setPreconfigs] = useState<{ name: string; rawConfig: RawConfig; svg: string; }[]>();
  const [selectedPreconfig, setSelectedPreconfig] = useState<string>();
  const [config, setConfig] = useState<Config>();

  async function setup() {
    // wait for preconfigs to be loaded, but at least some initial time to animate
    const start = Date.now();
    const buffer = await (await fetch(require('./domain/font/signika-bold.otf'))).arrayBuffer();
    await fontService.saveBuffer(buffer).catch(() => { });
    let persisted = await preconfigService.list();
    if (persisted.length === 0) {
      await Promise.all(predefinedConfigs.map((preconfig, i) => {
        preconfigService.save(preconfig as RawConfig, i);
      }));
      persisted = await preconfigService.list();
    }
    setPreconfigs(persisted);

    window.addEventListener('popstate', (e) => handleLocation(e));

    setTimeout(() => handleLocation(), Math.max(0, 500 - (Date.now() - start)));
  };

  function handleLocation(e?: Event) {
    const location = e !== undefined ? (e.currentTarget as Window).location.search : window.location.search;
    console.log(location);
    const preconfig = new URLSearchParams(location).get('name');
    preconfigService.selectByName(preconfig ? preconfig : undefined);
  }

  useEffect(() => {
    const preconfigsSubsription = preconfigService.preconfigs$.subscribe(setPreconfigs);
    const selectedPreconfigSubscription = preconfigService.selectedPreconfig$.subscribe(setSelectedPreconfig);
    const configSubscription = configService.config$.subscribe(setConfig);
    configService.config$
      .pipe(filter((c) => c.stages.length > 1))
      .pipe(first())
      .subscribe(() => animationService.animateDefault());

    setup();

    return () => {
      preconfigsSubsription.unsubscribe();
      selectedPreconfigSubscription.unsubscribe();
      configSubscription.unsubscribe();
    };
  }, []);

  return (
    <React.Fragment>
      <GoldenSeedsView
        preconfigs={preconfigs}
        selectedPreconfig={selectedPreconfig}
        config={config}
      />
      {process.env.APP_VERSION}
    </React.Fragment>
  );
}
