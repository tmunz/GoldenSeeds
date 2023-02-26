import React from 'react';

import { Config } from '../Config';
import { InputType } from '../../ui/input/Input';
import { Collapsable } from '../../ui/Collapsable';
import { editorStateService } from './EditorStateService';
import { configService } from '../ConfigService';
import { StageState, Stage } from '../stage/Stage';
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
  editStageId: string;
}

export class Editor extends React.Component<Props> {

  render() {
    return (
      <div className="editor">
        <div className="content-wrapper">
          {this.props.config.stages.map((stage, i) => {
            const stageId = stage.id;
            const types = svgGeneratorRegistry.types;
            const editMode = this.props.editStageId === stageId;
            return (
              <div
                key={stageId}
                className="stage"
                id={'stage-' + stageId}
              >
                <div className='stage-header'>
                  <h1
                    className="action"
                    onClick={() => editorStateService.setEditMode(editMode ? null : stageId)}
                  >
                    {stage.generator.type}
                  </h1>
                  <div className="controls">
                    <a target="_blank" onClick={() => 0 < i && configService.swapStages(i, i - 1)}>
                      <AnimatedButton
                        title="upmove"
                        rotation={AnimatedButton.DIRECTION_UP}
                        disabled={!(0 < i)}
                      />
                    </a>
                    <a target="_blank" onClick={() => i < this.props.config.stages.length - 1 && configService.swapStages(i, i + 1)}>
                      <AnimatedButton
                        title="downmove"
                        rotation={AnimatedButton.DIRECTION_DOWN}
                        disabled={!(i < this.props.config.stages.length - 1)}
                      />
                    </a>
                    <a target="_blank" onClick={() => configService.deleteStage(stageId)}>
                      <AnimatedButton
                        title="remove"
                        points={[PlusNone, PlusRegular, PlusRotated]}
                        rotation={45}
                      />
                    </a>
                  </div>
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
                      stage,
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
      </div>
    );
  }

  private generateEntryModifier(
    stage: Stage,
    id: string,
    definition: ParamDefinition,
    state: StageState<any>,
  ) {
    const props = editorService.getInputFieldConfiguration(
      definition.type,
      stage.id,
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
            configService.setConfigValue(stage.id, id, rawValue)
          }
        />
        {definition.animateable &&
          <AnimationController
            stageId={stage.id}
            id={id}
            value={state.value}
            currentlyAnimating={id === stage.animatedId}
          />
        }
      </div>
    );
  }
}
