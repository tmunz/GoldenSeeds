import * as React from 'react';

import { setConfigValue, setType, setEditMode } from '../store/Actions';
import { Config, StageState } from '../Config';
import { Converter } from '../converter';
import { DrawConfigInput } from './DrawConfigInput';
import { InputType } from '../ui/input/Input';
import { Collapsable } from '../ui/Collapsable';
import { stageRegistry } from '../stage';

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
                onClick={() => setEditMode(editMode ? null : stageId)}>
                {stageId}
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
                  onChange={(type: string) => setType(stageId, type)}
                />
                {
                  (Object.keys(stage.converter)).map((key: string) =>
                    this.generateEntryModifier(
                      stageId,
                      stage.converter[key],
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

  private generateEntryModifier(stageId: number, converter: Converter<any>, configItem: StageState<any>) {
    return <DrawConfigInput
      key={converter.name
      }
      {...converter.getInputFieldConfiguration(stageId, configItem)}
      onChange={(rawValue: any) => setConfigValue(stageId, converter.name, rawValue)}
    />;
  }
}
