import { ReactNode } from 'react';
import { ParamDefinition } from '../../generator/SvgGenerator';
import { StageItemState } from '../../config/stageItemState/StageItemState';

export abstract class EditorInput<T, U> {
  abstract getEditorInput(
    name: string,
    definition: ParamDefinition,
    state: StageItemState<T, U>,
    action: (value: U) => void,
  ): ReactNode;
}
