import React, { useState, useEffect } from 'react';

import { GoldenSeedsView } from './view/GoldenSeedsView';
import { configService } from './domain/config/ConfigService';
import { editorStateService } from './domain/editor/EditorStateService';
import { animationService } from './domain/animation/AnimationService';

export function App() {
  const [preconfigIndex, setPreconfigIndex] = useState();
  const [editStageId, setEditStageId] = useState();
  const [config, setConfig] = useState();

  useEffect(() => {
    const preconfigSubscription = configService.preconfigIndex$.subscribe(setPreconfigIndex as any);
    const editStageIdSubscription = editorStateService.editStageId$.subscribe(setEditStageId as any);
    const configSubscription = configService.config$.subscribe(setConfig as any);

    setTimeout(() => {
      configService.selectPreconfig(0);
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
