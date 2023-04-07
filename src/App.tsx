import React, { useState, useEffect } from 'react';

import { GoldenSeedsView } from './view/GoldenSeedsView';
import { configService } from './domain/config/ConfigService';
import { Config } from './domain/config/Config';
import { editorStateService } from './domain/editor/EditorStateService';
import { animationService } from './domain/animation/AnimationService';

export function App() {
  const [preconfigIndex, setPreconfigIndex] = useState<number>();
  const [editStageId, setEditStageId] = useState<string | null>(null);
  const [config, setConfig] = useState<Config>();

  useEffect(() => {
    const preconfigSubscription = configService.preconfigIndex$.subscribe(setPreconfigIndex);
    const editStageIdSubscription = editorStateService.editStageId$.subscribe(setEditStageId);
    const configSubscription = configService.config$.subscribe(setConfig);

    setTimeout(() => {
      const preconfig = new URLSearchParams(window.location.search).get('name');
      configService.selectPreconfigByName(preconfig);
      animationService.animateDefault();
    }, 500);

    return () => {
      preconfigSubscription.unsubscribe();
      editStageIdSubscription.unsubscribe();
      configSubscription.unsubscribe();
    };
  }, []);

  return (
    <React.Fragment>
      <GoldenSeedsView preconfigIndex={preconfigIndex} config={config} editStageId={editStageId} />
      {process.env.APP_VERSION}
    </React.Fragment>
  );
}
