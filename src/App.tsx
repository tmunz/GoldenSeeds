import React, { useState, useEffect } from 'react';

import { GoldenSeedsView } from './view/GoldenSeedsView';
import { configService } from './domain/ConfigService';
import { editorStateService } from './domain/editor/EditorStateService';
import { animationService } from './domain/animation/AnimationService';

export function App() {
  const [preconfigIndex, setPreconfigIndex] = useState();
  const [config, setConfig] = useState();
  const [editStageId, setEditStageId] = useState();

  useEffect(() => {
    const preconfigSubscription = configService.preconfigIndex$.subscribe(
      setPreconfigIndex as any,
    );
    const configSubscription = configService.config$.subscribe(
      setConfig as any,
    );
    const editStageIdSubscription = editorStateService.editStageId$.subscribe(
      setEditStageId as any,
    );

    setTimeout(() => {
      configService.selectPreconfig(0);
      animationService.animateDefault();
    }, 500);

    return () => {
      preconfigSubscription.unsubscribe();
      configSubscription.unsubscribe();
      editStageIdSubscription.unsubscribe();
    };
  }, []);

  return (
    <GoldenSeedsView
      preconfigIndex={preconfigIndex}
      config={config}
      editStageId={editStageId}
    />
  );
}
