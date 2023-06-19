import { ReactNode } from 'react';
import { ParamDefinitionType, ParamDefinition } from '../generator/SvgGenerator';
import { StageItemState } from '../config/stageItemState/StageItemState';
import { ColorEditor } from './editorInput/ColorEditor';
import { ExpressionEditor } from './editorInput/ExpressionEditor';
import { NumberEditor } from './editorInput/NumberEditor';
import { SelectionEditor } from './editorInput/SelectionEditor';
import { StringEditor } from './editorInput/StringEditor';
import { EditorInput } from './editorInput/EditorInput';
import { FontEditor } from './editorInput/FontEditor';

export class EditorService {

  private editorInputUis: Record<ParamDefinitionType, EditorInput<unknown, unknown>> = {
    color: new ColorEditor(),
    expression: new ExpressionEditor(),
    number: new NumberEditor(),
    selection: new SelectionEditor(),
    string: new StringEditor(),
    font: new FontEditor(),
  };

  getEditorInput<G, S>(
    type: ParamDefinitionType,
    name: string,
    definition: ParamDefinition,
    state: StageItemState<G, S>,
    action: (value: unknown) => void,
  ): ReactNode {
    return this.editorInputUis[type].getEditorInput(name, definition, state, action);
  }
}

export const editorService = new EditorService();
