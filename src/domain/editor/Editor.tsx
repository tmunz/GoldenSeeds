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
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps}>
                          <StageEditor
                            dragHandleProps={provided.dragHandleProps}
                            stage={stage}
                            hasNext={i < this.props.config.stages.length - 1}
                            i={i}
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
}
