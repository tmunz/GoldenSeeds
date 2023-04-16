import { ReactNode } from 'react';
import { StageItemState } from '../../config/Stage';
import { ParamDefinition } from '../../generator/SvgGenerator';

export abstract class EditorInput<T> {
  abstract getEditorInput(
    name: string,
    definition: ParamDefinition,
    state: StageItemState<T>,
    action: (value: string) => void,
  ): ReactNode;
}
