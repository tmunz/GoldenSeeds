import React, { useState, useEffect } from 'react';
import { first, filter } from 'rxjs/operators';

import { GoldenSeedsView } from './view/GoldenSeedsView';
import { preconfigService } from './domain/preconfig/PreconfigService';
import { Config } from './domain/config/Config';
import { editorService } from './domain/editor/EditorService';
import { animationService } from './domain/animation/AnimationService';
import { configService } from './domain/config/ConfigService';

export function App() {
  const [selectedPreconfig, setSelectedPreconfig] = useState<string>();
  const [editStageId, setEditStageId] = useState<string | null>(null);
  const [config, setConfig] = useState<Config>();

  useEffect(() => {
    const preconfigSubscription = preconfigService.preconfig$.subscribe(setSelectedPreconfig);
    const editStageIdSubscription = editorService.editStageId$.subscribe(setEditStageId);
    const configSubscription = configService.config$.subscribe(setConfig);
    configService.config$
      .pipe(filter((c) => c.stages.length > 1))
      .pipe(first())
      .subscribe(() => animationService.animateDefault());

    setTimeout(() => {
      const preconfig = new URLSearchParams(window.location.search).get('name');
      preconfigService.selectPreconfigByName(preconfig ? preconfig : undefined);
    }, 500);

    return () => {
      preconfigSubscription.unsubscribe();
      editStageIdSubscription.unsubscribe();
      configSubscription.unsubscribe();
    };
  }, []);

  return (
    <React.Fragment>
      <GoldenSeedsView selectedPreconfig={selectedPreconfig} config={config} editStageId={editStageId} />
      {process.env.APP_VERSION}
    </React.Fragment>
  );
}
