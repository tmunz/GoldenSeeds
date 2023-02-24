import React from 'react';

import { Config } from '../Config';
import { InputType } from '../../ui/input/Input';
import { Collapsable } from '../../ui/Collapsable';
import { editorStateService } from './EditorStateService';
import { configService } from '../ConfigService';
import { StageState } from '../stage/Stage';
import { svgGeneratorRegistry } from '../generator/SvgGeneratorRegistry';
import { EditorInput } from './EditorInput';
import { editorService } from './EditorService';
import { ParamDefinition } from '../generator/SvgGenerator';
import { PlusNone, PlusRegular, PlusRotated } from '../../ui/icon/Plus';
import { AnimationController } from '../tools/AnimationController';

import './Editor.styl';
import { AnimatedButton } from '../../ui/AnimatedButton';


interface Props {
  config: Config;
  editStageId: number;
}

export class Editor extends React.Component<Props> {

  render() {
    return (
      <div className="overlay editor">
        {this.props.config.stages.map((stage, i) => {
          const stageId = i;
          const types = svgGeneratorRegistry.types;
          const editMode = this.props.editStageId === stageId;
          return (
            <div
              key={stageId}
              className="stage"
              id={'stage-' + stageId}
            >
              <div className={`stage-header ${editMode ? 'edit-mode' : ''}`}>
                <a target="_blank" onClick={() => configService.deleteStage(stageId)}>
                  <AnimatedButton
                    title="remove"
                    points={[PlusNone, PlusRegular, PlusRotated]}
                    rotation={45}
                  />
                </a>
                <a target="_blank" onClick={() => stageId < this.props.config.stages.length - 1 && this.swapStages(stageId, stageId + 1)}>
                  <AnimatedButton
                    title="downmove"
                    rotation={AnimatedButton.DIRECTION_DOWN}
                    disabled={!(stageId < this.props.config.stages.length - 1)}
                  />
                </a>
                <a target="_blank" onClick={() => 0 < stageId && this.swapStages(stageId, stageId - 1)}>
                  <AnimatedButton
                    title="upmove"
                    rotation={AnimatedButton.DIRECTION_UP}
                    disabled={!(0 < stageId)}
                  />
                </a>
                <h1
                  className="action"
                  onClick={() => editorStateService.setEditMode(editMode ? null : stageId)}
                >
                  {stage.generator.type}
                </h1>
              </div>
              <Collapsable key={stageId} show={editMode}>
                <EditorInput
                  label="type"
                  inputType={InputType.RANGE}
                  textValue={stage.generator.type}
                  rangeValue={types.findIndex(
                    (s: string) => s === stage.generator.type,
                  )}
                  min={0}
                  max={types.length - 1}
                  valid
                  convertToString={(i) => types[i]}
                  onChange={(type: string) =>
                    configService.setType(stageId, type)
                  }
                />
                {Object.keys(stage.state).map((key: string) =>
                  this.generateEntryModifier(
                    stageId,
                    key,
                    stage.generator.definition[key],
                    stage.state[key],
                  ),
                )}
              </Collapsable>
            </div>
          );
        })}
        <div className='stage-header'>
          <a target="_blank" onClick={() => configService.addStage()}>
            <AnimatedButton
              title="add"
              points={[PlusNone, PlusRegular, PlusRotated]}
            />
          </a>
        </div>
      </div>
    );
  }

  private swapStages(a: number, b: number): void {
    configService.swapStages(a, b);
    if (this.props.editStageId === a) {
      editorStateService.setEditMode(b);
    } else if (this.props.editStageId === b) {
      editorStateService.setEditMode(a);
    }
  }

  private generateEntryModifier(
    stageId: number,
    id: string,
    definition: ParamDefinition,
    state: StageState<any>,
  ) {
    const props = editorService.getInputFieldConfiguration(
      definition.type,
      stageId,
      id,
      definition,
      state,
    );

    return (
      <div className='editor-item'>
        <EditorInput
          {...props}
          key={id}
          onChange={(rawValue: any) =>
            configService.setConfigValue(stageId, id, rawValue)
          }
        />
        {definition.animateable &&
          <AnimationController
            target={state.value}
            onNewFrame={v => configService.setConfigValue(stageId, id, "" + v)}
          />
        }
      </div>
    );
  }
}
