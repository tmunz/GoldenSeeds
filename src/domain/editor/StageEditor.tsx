import React, { ComponentProps, useState } from 'react';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';

import { Collapsable } from '../../ui/Collapsable';
import { svgGeneratorRegistry } from '../generator/SvgGeneratorRegistry';
import { Stage } from '../config/Stage';
import { StageItemState } from '../config/stageItemState/StageItemState';
import { configService } from '../config/ConfigService';
import { AnimatedButton, DIRECTION_UP, DIRECTION_DOWN } from '../../ui/AnimatedButton';
import { PlusNone, PlusRegular, PlusRotated } from '../../ui/icon/Plus';
import { editorService } from './EditorService';
import { ParamDefinition } from '../generator/SvgGenerator';
import { AnimationController } from '../animation/AnimationController';
import { CarouselSelector } from '../../ui/CarouselSelector';
import { InlineTextInput } from '../../ui/input/InlineTextInput';


export interface Props extends ComponentProps<'div'> {
  stage: Stage;
  i: number;
  hasNext: boolean;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  style?: React.CSSProperties;
}

export function StageEditor({ stage, i, hasNext, dragHandleProps, style }: Props) {

  const [editMode, setEditMode] = useState<string | null>(null);

  const types = svgGeneratorRegistry.types;

  const generateEntryModifier = (
    stage: Stage,
    groupId: string,
    id: string,
    definition: ParamDefinition,
    state: StageItemState<unknown, unknown>,
  ) => {
    const action = (value: any) => configService.setConfigValue(stage.id, groupId, id, value);
    const editorUi = editorService.getEditorInput(definition.type, id, definition, state, action);
    return (
      <div className="editor-item" key={id}>
        {editorUi}
        {false && definition.animateable && ( // animation is currently disabled
          <AnimationController
            stageId={stage.id}
            groupId={groupId}
            id={id}
            value={state.getValue() as number}
            currentlyAnimating={id === stage.animatedId}
          />
        )}
      </div>
    );
  };

  return (
    <div key={stage.id} className="stage">
      <div className="stage-header" style={style} {...dragHandleProps} id={stage.id}>
        <div className="stage-header-title">
          <button onClick={() => setEditMode(editMode ? null : stage.id)}>
            <h1>{stage.generator.type}</h1>
          </button>
          <InlineTextInput
            className="name"
            placeholder={`#${stage.id}`}
            value={stage.name}
            onChange={(e) => configService.setStageName(stage.id, e)}
          />
        </div>
        <div className="controls">
          <AnimatedButton
            title="upmove"
            onClick={() => 0 < i && configService.moveToIndex(stage.id, i - 1)}
            disabled={!(0 < i)}
            rotation={DIRECTION_UP}
          />
          <AnimatedButton
            title="downmove"
            onClick={() => hasNext && configService.moveToIndex(stage.id, i + 1)}
            rotation={DIRECTION_DOWN}
            disabled={!hasNext}
          />
          <AnimatedButton
            title="remove"
            onClick={() => configService.deleteStage(stage.id)}
            points={[PlusNone, PlusRegular, PlusRotated]}
            rotation={45}
          />
        </div>
      </div>
      <Collapsable key={stage.id} show={editMode === stage.id} className="stage-content">
        <CarouselSelector
          className="stage-type-selector"
          items={types.map(name => ({ name, svg: null }))}
          select={(type) => configService.setType(stage.id, type)}
          selected={stage.generator.type}
          scale={1.5}
        />
        {Object.keys(stage.state.data).map((groupId) => (
          <div className="stage-group" key={groupId}>
            <h2>{groupId}</h2>
            <div className="stage-group-content">
              {Object.keys(stage.state.data[groupId]).map((id: string) =>
                generateEntryModifier(
                  stage,
                  groupId,
                  id,
                  stage.generator.definition[groupId][id],
                  stage.state.data[groupId][id],
                ),
              )}
            </div>
          </div>
        ))}
      </Collapsable>
    </div>
  );
}
