import React, { useState } from 'react';

import { Config } from '../config/Config';
import { configService } from '../config/ConfigService';
import { PlusNone, PlusRegular, PlusRotated } from '../../ui/icon/Plus';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { StageEditor } from './StageEditor';

import './Editor.styl';


export function Editor(props: { config: Config }) {

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleDragStart = (stageId: string, e: React.DragEvent<any>) => {
    const dragHandle = "stage-header";

    const isFromStageHeader = e.nativeEvent.composedPath().some(
      (el) => el instanceof HTMLElement && el.classList.contains(dragHandle)
    );
  
    if (!isFromStageHeader) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setDragImage(e.target as any, 20, 20);
    e.dataTransfer.setData("text/plain", stageId);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setHoveredIndex(index);
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    const stageId = e.dataTransfer.getData("text/plain");
    setHoveredIndex(null);
    configService.moveToIndex(stageId, index);
  };

  const handleDragLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className="editor">
      <div className="content-wrapper">
        {props.config.stages.map((stage, i) => (
          <div
            key={i}
            className={`stage ${hoveredIndex === i ? "dnd-over" : ""}`}
          >
            <StageEditor
              stage={stage}
              hasNext={i < props.config.stages.length - 1}
              i={i}
              drag={{
                onDragStart: (e) => handleDragStart(stage.id, e),
                onDragOver: (e) => handleDragOver(e, i),
                onDrop: (e) => handleDrop(e, i),
                onDragLeave: handleDragLeave,
              }}
            />
          </div>
        ))}
        <div className="stage-header" key="add">
          <AnimatedButton
            onClick={() => configService.addStage()}
            title="add"
            points={[PlusNone, PlusRegular, PlusRotated]}
          />
        </div>
      </div>
    </div>
  );
}
