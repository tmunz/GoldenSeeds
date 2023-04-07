import React from 'react';
import { Draggable, Droppable, DragDropContext, DropResult } from 'react-beautiful-dnd';

import { Config } from '../config/Config';
import { configService } from '../config/ConfigService';
import { PlusNone, PlusRegular, PlusRotated } from '../../ui/icon/Plus';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { StageEditor } from './StageEditor';

import './Editor.styl';

interface Props {
  config: Config;
  editStageId?: string;
}

export class Editor extends React.Component<Props> {
  onDragEnd = (result: DropResult) => {
    if (result.destination?.droppableId === 'stages') {
      configService.moveToIndex(result.draggableId, result.destination.index);
    }
  };

  render() {
    return (
      <div className="editor">
        <div className="content-wrapper">
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable droppableId="stages">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {this.props.config.stages.map((stage, i) => (
                    <Draggable key={stage.id} draggableId={stage.id} index={i}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.draggableProps}>
                          <StageEditor
                            dragHandleProps={provided.dragHandleProps}
                            stage={stage}
                            stagesTotal={this.props.config.stages.length}
                            i={i}
                            editMode={this.props.editStageId === stage.id}
                          ></StageEditor>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <div className="stage-header" key="add">
            <a target="_blank" onClick={() => configService.addStage()}>
              <AnimatedButton title="add" points={[PlusNone, PlusRegular, PlusRotated]} />
            </a>
          </div>
        </div>
      </div>
    );
  }
}
