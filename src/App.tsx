import React, { useState, useEffect } from 'react';
import { first, filter } from 'rxjs/operators';

import { GoldenSeedsView } from './view/GoldenSeedsView';
import { preconfigService } from './domain/preconfig/PreconfigService';
import { Config } from './domain/config/Config';
import { editorService } from './domain/editor/EditorService';
import { animationService } from './domain/animation/AnimationService';
import { configService } from './domain/config/ConfigService';
import { preconfigs as predefinedConfigs } from './domain/preconfig/data';
import { RawConfig } from './domain/config/RawConfig';

export function App() {
  const [preconfigs, setPreconfigs] = useState<{ name: string; rawConfig: RawConfig; svg: string; }[]>();
  const [selectedPreconfig, setSelectedPreconfig] = useState<string>();
  const [editStageId, setEditStageId] = useState<string | null>(null);
  const [config, setConfig] = useState<Config>();

  async function setup() {
    // wait for preconfigs to be loaded, but at least some initial time to animate
    const start = Date.now();
    let persisted = await preconfigService.list();
    if (persisted.length === 0) {
      await Promise.all(predefinedConfigs.map((preconfig, i) => {
        preconfigService.save(preconfig as RawConfig, i);
      }));
      persisted = await preconfigService.list();
    }
    setPreconfigs(persisted);
    setTimeout(() => {
      const preconfig = new URLSearchParams(window.location.search).get('name');
      preconfigService.selectPreconfigByName(preconfig ? preconfig : undefined);
    }, Math.max(0, 500 - (Date.now() - start)));
  };

  useEffect(() => {
    const preconfigsSubsription = preconfigService.preconfigs$.subscribe(setPreconfigs);
    const selectedPreconfigSubscription = preconfigService.selectedPreconfig$.subscribe(setSelectedPreconfig);
    const editStageIdSubscription = editorService.editStageId$.subscribe(setEditStageId);
    const configSubscription = configService.config$.subscribe(setConfig);
    configService.config$
      .pipe(filter((c) => c.stages.length > 1))
      .pipe(first())
      .subscribe(() => animationService.animateDefault());

    setup();

    return () => {
      preconfigsSubsription.unsubscribe();
      selectedPreconfigSubscription.unsubscribe();
      editStageIdSubscription.unsubscribe();
      configSubscription.unsubscribe();
    };
  }, []);

  return (
    <React.Fragment>
      <GoldenSeedsView
        preconfigs={preconfigs}
        selectedPreconfig={selectedPreconfig}
        config={config}
        editStageId={editStageId}
      />
      {process.env.APP_VERSION}
    </React.Fragment>
  );
}
