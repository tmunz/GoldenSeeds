import * as React from 'react';

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
          const types = svgGeneratorRegistry.types;
          const editMode = this.props.editStageId === stageId;
          return (
            <div key={stageId} className={'stage ' + stageId}>
              <h1
                className={`stage action ${editMode ? 'edit-mode' : ''}`}
                onClick={() => editorStateService.setEditMode(editMode ? null : stageId)}>
                Stage {stageId + 1}
              </h1>
              <Collapsable key={stageId} show={editMode}>
                <EditorInput
                  label="type"
                  inputType={InputType.RANGE}
                  textValue={stage.generator.type}
                  rangeValue={types.findIndex((s: string) => s === stage.generator.type)}
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
                      stage.generator.definition[key],
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

  private generateEntryModifier(stageId: number, id: string, definition: ParamDefinition, state: StageState<any>) {
    const props = editorService.getInputFieldConfiguration(definition.type, stageId, id, definition, state);

    console.log(definition.type, stageId, id, definition, state, props)

    return <EditorInput
      {...props}
      key={id}
      onChange={(rawValue: any) => configService.setConfigValue(stageId, id, rawValue)}
    />;
  }
}
