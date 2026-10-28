import React, { useState, useEffect } from 'react';

import { MainView } from './view/MainView';
import { Config } from './domain/config/Config';
import { configService } from './domain/config/ConfigService';
import { fontService } from './domain/font/FontService';
import { configManager, ConfigItem } from './domain/config/ConfigManager';
import { preconfigs } from './domain/config/data';

const SignikaBoldFont = require('./domain/font/signika-bold.otf'); // eslint-disable-line

export function App() {
  const [initialViewerOpen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return Boolean(params.get('id') || params.get('name'));
  });
  const [configItems, setConfigItems] = useState<ConfigItem[]>([]);
  const [configsManageable, setConfigsManageable] = useState<boolean>(false);
  const [activeConfig, setActiveConfig] = useState<Config>();

  useEffect(() => {
    const configItemsSubscription = configManager.configItems$.subscribe(setConfigItems);
    const configsManageableSubscription = configManager.configsManageable$.subscribe(setConfigsManageable);
    const activeConfigSubscription = configService.config$.subscribe(setActiveConfig);

    let disposed = false;
    let startupTimeout: ReturnType<typeof setTimeout> | undefined;
    async function setup() {
      const start = Date.now();
      const buffer = await (await fetch(SignikaBoldFont)).arrayBuffer();
      await fontService.saveBuffer(buffer).catch(() => console.warn('font could not be loaded'));
      await configManager.init();
      if (disposed) { return; }
      window.addEventListener('popstate', handleLocation);
      startupTimeout = setTimeout(handleLocation, Math.max(0, 1000 - (Date.now() - start)));
    }
    void setup();

    return () => {
      disposed = true;
      clearTimeout(startupTimeout);
      window.removeEventListener('popstate', handleLocation);
      configItemsSubscription.unsubscribe();
      configsManageableSubscription.unsubscribe();
      activeConfigSubscription.unsubscribe();
    };
  }, []);

  return (
    <MainView
      initialViewerOpen={initialViewerOpen}
      configItems={configItems}
      configsManageable={configsManageable}
      activeConfig={activeConfig}
    />
  );
}

function handleLocation() {
  const params = new URLSearchParams(window.location.search);
  const configName = params.get('id') || params.get('name');
  configManager.select(configName || preconfigs[0]?.meta.name, { updateUrl: false });
}
