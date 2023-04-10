import React, { ComponentProps, Fragment } from 'react';

import { InputType } from '../../ui/input/Input';
import { Collapsable } from '../../ui/Collapsable';
import { editorStateService } from './EditorStateService';
import { svgGeneratorRegistry } from '../generator/SvgGeneratorRegistry';
import { Stage, StageItemState } from '../stage/Stage';
import { configService } from '../config/ConfigService';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { PlusNone, PlusRegular, PlusRotated } from '../../ui/icon/Plus';
import { EditorInput } from './EditorInput';
import { editorService } from './EditorService';
import { ParamDefinition } from '../generator/SvgGenerator';
import { AnimationController } from '../animation/AnimationController';

export interface Props extends ComponentProps<'div'> {
  stage: Stage;
  i: number;
  stagesTotal: number;
  editMode: boolean;
  dragHandleProps: any;
}

export function StageEditor({ stage, i, stagesTotal, editMode, dragHandleProps }: Props) {
  const types = svgGeneratorRegistry.types;

  const generateEntryModifier = (
    stage: Stage,
    groupId: string,
    id: string,
    definition: ParamDefinition,
    state: StageItemState<any>,
  ) => (
    <div className="editor-item" key={id}>
      <EditorInput
        {...editorService.getInputFieldConfiguration(definition.type, id, definition, state)}
        onChange={(textValue: any) => configService.setConfigValue(stage.id, groupId, id, textValue)}
      />
      {definition.animateable && (
        <AnimationController
          stageId={stage.id}
          groupId={groupId}
          id={id}
          value={state.value}
          currentlyAnimating={id === stage.animatedId}
        />
      )}
    </div>
  );

  return (
    <div key={stage.id} className="stage" id={'stage-' + stage.id}>
      <div className="stage-header" {...dragHandleProps}>
        <h1 className="action" onClick={() => editorStateService.setEditMode(editMode ? null : stage.id)}>
          {stage.generator.type}
        </h1>
        <div className="controls">
          <a target="_blank" onClick={() => 0 < i && configService.moveToIndex(stage.id, i - 1)}>
            <AnimatedButton title="upmove" rotation={AnimatedButton.DIRECTION_UP} disabled={!(0 < i)} />
          </a>
          <a target="_blank" onClick={() => i < stagesTotal - 1 && configService.moveToIndex(stage.id, i + 1)}>
            <AnimatedButton
              title="downmove"
              rotation={AnimatedButton.DIRECTION_DOWN}
              disabled={!(i < stagesTotal - 1)}
            />
          </a>
          <a target="_blank" onClick={() => configService.deleteStage(stage.id)}>
            <AnimatedButton title="remove" points={[PlusNone, PlusRegular, PlusRotated]} rotation={45} />
          </a>
        </div>
      </div>
      <Collapsable key={stage.id} show={editMode}>
        <EditorInput
          label="type"
          inputType={InputType.RANGE}
          output={stage.generator.type}
          value={types.findIndex((s: string) => s === stage.generator.type)}
          min={0}
          max={types.length - 1}
          valid
          onChange={(index) => configService.setType(stage.id, types[index])}
        />
        {Object.keys(stage.state.data).map((groupId) => (
          <Fragment key={groupId}>
            <div>{groupId}</div>
            {Object.keys(stage.state.data[groupId]).map((id: string) =>
              generateEntryModifier(
                stage,
                groupId,
                id,
                stage.generator.definition[groupId][id],
                stage.state.data[groupId][id],
              ),
            )}
          </Fragment>
        ))}
      </Collapsable>
    </div>
  );
}
