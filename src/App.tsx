import React, { useState, useEffect } from 'react';
import { first, filter } from 'rxjs/operators';

import { GoldenSeedsView } from './view/GoldenSeedsView';
import { Config } from './domain/config/Config';
import { animationService } from './domain/animation/AnimationService';
import { configService } from './domain/config/ConfigService';
import { RawConfig } from './domain/config/RawConfig';
import { fontService } from './domain/font/FontService';
import { configManager } from './domain/config/ConfigManager';

export function App() {
  const [configs, setConfigs] = useState<{ name: string; rawConfig: RawConfig; svg: string | null; }[]>([]);
  const [configsManageable, setConfigsManageable] = useState<boolean>(false);
  const [activeConfig, setActiveConfig] = useState<Config>();

  async function setup() {
    // wait for preconfigs to be loaded, but at least some initial time to animate
    const start = Date.now();
    const buffer = await (await fetch(require('./domain/font/signika-bold.otf'))).arrayBuffer();
    await fontService.saveBuffer(buffer).catch(() => { });
    await configManager.init();
    window.addEventListener('popstate', (e) => handleLocation(e));
    setTimeout(() => handleLocation(), Math.max(0, 500 - (Date.now() - start)));
  };

  function handleLocation(e?: Event) {
    const location = e !== undefined ? (e.currentTarget as Window).location.search : window.location.search;
    const preconfig = new URLSearchParams(location).get('name');
    configManager.selectByName(preconfig ? preconfig : undefined);
  }

  useEffect(() => {
    const configsSubsription = configManager.configs$.subscribe(setConfigs);
    const configsManageableSubscription = configManager.configsManageable$.subscribe(setConfigsManageable);
    const activeConfigSubscription = configService.config$.subscribe(setActiveConfig);
    configService.config$
      .pipe(filter((c) => c.stages.length > 1))
      .pipe(first())
      .subscribe(() => animationService.animateDefault());

    setup();

    return () => {
      configsSubsription.unsubscribe();
      configsManageableSubscription.unsubscribe();
      activeConfigSubscription.unsubscribe();
    };
  }, []);

  return (
    <React.Fragment>
      <GoldenSeedsView
        configs={configs}
        configsManageable={configsManageable}
        activeConfig={activeConfig}
      />
      {process.env.APP_VERSION}
    </React.Fragment>
  );
}
