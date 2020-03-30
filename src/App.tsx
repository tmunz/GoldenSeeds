import React, { useState, useEffect } from 'react';

import { GoldenSeedsView } from './view/GoldenSeedsView';
import { stageService } from './stage/StageService';

export function App() {
  const [preconfigIndex, setPreconfigIndex] = useState();
  const [config, setConfig] = useState();
  const [editStageId, setEditStageId] = useState();

  useEffect(() => {
    const preconfigSubscription = stageService.preconfigIndex$.subscribe(setPreconfigIndex as any);
    const configSubscription = stageService.config$.subscribe(setConfig as any);
    const editStageIdSubscription = stageService.editStageId$.subscribe(setEditStageId as any);
    return () => {
      preconfigSubscription.unsubscribe();
      configSubscription.unsubscribe();
      editStageIdSubscription.unsubscribe();
    }
  }, []);

  return (
    <GoldenSeedsView
      preconfigIndex={preconfigIndex}
      config={config}
      editStageId={editStageId}
    />
  );
}
