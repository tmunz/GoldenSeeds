import { ReactNode } from 'react';
import { ParamDefinitionType, ParamDefinition } from '../generator/SvgGenerator';
import { StageItemState } from '../stage/Stage';
import { ColorEditor } from './ui/ColorEditor';
import { ExpressionEditor } from './ui/ExpressionEditor';
import { NumberEditor } from './ui/NumberEditor';
import { SelectionEditor } from './ui/SelectionEditor';
import { StringEditor } from './ui/StringEditor';
import { BehaviorSubject } from 'rxjs';
import { EditorInput } from './ui/EditorInput';
import { FontEditor } from './ui/FontEditor';


export class EditorService {

  editStageId$ = new BehaviorSubject<string | null>(null);

  private editorUis: Record<ParamDefinitionType, EditorInput<any>> = {
    'color': new ColorEditor(),
    'expression': new ExpressionEditor(),
    'number': new NumberEditor(),
    'selection': new SelectionEditor(),
    'string': new StringEditor(),
    'font': new FontEditor(), 
  };

  setEditMode(stageId: string | null) {
    this.editStageId$.next(stageId);
  }

  getEditorInput<T>(
    type: ParamDefinitionType,
    name: string,
    definition: ParamDefinition,
    state: StageItemState<T>,
    action: (value: string) => void,
  ): ReactNode {
    return this.editorUis[type].getEditorInput(name, definition, state, action);
  }
}

export const editorService = new EditorService();
