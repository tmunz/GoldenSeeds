import React, { useState, useEffect, useCallback } from 'react';
import { first, filter } from 'rxjs/operators';

import { GoldenSeedsView } from './view/GoldenSeedsView';
import { Config } from './domain/config/Config';
import { animationService } from './domain/animation/AnimationService';
import { configService } from './domain/config/ConfigService';
import { fontService } from './domain/font/FontService';
import { configManager, ConfigItem } from './domain/config/ConfigManager';
import { preconfigs } from './domain/config/data';

const SignikaBoldFont = require('./domain/font/signika-bold.otf'); // eslint-disable-line

export function App() {
  const [configItems, setConfigItems] = useState<ConfigItem[]>([]);
  const [configsManageable, setConfigsManageable] = useState<boolean>(false);
  const [activeConfig, setActiveConfig] = useState<Config>();

  const setup = useCallback(async () => {
    // wait for preconfigs to be loaded, but at least some initial time to animate
    const start = Date.now();
    const buffer = await (await fetch(SignikaBoldFont)).arrayBuffer();
    await fontService.saveBuffer(buffer).catch(() => console.warn('font could not be loaded'));
    await configManager.init();
    window.addEventListener('popstate', (e) => handleLocation(e));
    setTimeout(() => handleLocation(), Math.max(0, 1000 - (Date.now() - start)));
  }, []);

  function handleLocation(e?: Event) {
    const location = e !== undefined ? (e.currentTarget as Window).location.search : window.location.search;
    const configName = new URLSearchParams(location).get('name');
    configManager.select(configName ? configName : preconfigs[0]?.meta.name);
  }

  useEffect(() => {
    const configItemsSubsription = configManager.configItems$.subscribe(setConfigItems);
    const configsManageableSubscription = configManager.configsManageable$.subscribe(setConfigsManageable);
    const activeConfigSubscription = configService.config$.subscribe(setActiveConfig);
    configService.config$
      .pipe(filter((c) => c.stages.length > 1))
      .pipe(first())
      .subscribe(() => animationService.animateDefault());

    setup();

    return () => {
      configItemsSubsription.unsubscribe();
      configsManageableSubscription.unsubscribe();
      activeConfigSubscription.unsubscribe();
    };
  }, [setup]);

  return (
    <GoldenSeedsView
      configItems={configItems}
      configsManageable={configsManageable}
      activeConfig={activeConfig}
    />
  );
}
