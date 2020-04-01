import * as React from 'react';

import { Config } from '../../Config';
import { DrawConfigInput } from './DrawConfigInput';
import { InputType } from '../../../ui/input/Input';
import { Collapsable } from '../../../ui/Collapsable';
import { editorService } from './EditorService';
import { stageRegistry } from '../StageRegistry';
import { configService } from '../../ConfigService';
import { StageState } from '../Stage';

import './Editor.styl';


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
          const types = stageRegistry.types;
          const editMode = this.props.editStageId === stageId;
          return (
            <div key={stageId} className={'stage ' + stageId}>
              <h1
                className={`stage action ${editMode ? 'edit-mode' : ''}`}
                onClick={() => editorService.setEditMode(editMode ? null : stageId)}>
                Stage {stageId + 1}
              </h1>
              <Collapsable key={stageId} show={editMode}>
                <DrawConfigInput
                  label="type"
                  inputType={InputType.RANGE}
                  textValue={stage.type}
                  rangeValue={types.findIndex((s: string) => s === stage.type)}
                  min={0}
                  max={types.length - 1}
                  valid
                  convertToString={i => types[i]}
                  onChange={(type: string) => configService.setType(stageId, type)}
                />
                {
                  (Object.keys(stage.state)).map((key: string) =>
                    this.generateEntryModifier(
                      stageId,
                      key,
                      stage.state[key],
                    )
                  )
                }
              </Collapsable>
            </div>
          );
        })
        }
      </div >
    );
  }

  private generateEntryModifier(stageId: number, id: string, state: StageState<any>) {
    {/* TODO ...converter.getInputFieldConfiguration(stageId, state) */ }

    return <DrawConfigInput
      key={id}
      onChange={(rawValue: any) => configService.setConfigValue(stageId, id, rawValue)}

      inputType={InputType.TEXT}
      label={id}
      textValue={state.rawValue}
      rangeValue={state.value}
    />;
  }
}
