import { ParamDefinitionType } from '../../generator/SvgGenerator';
import { ColorState } from './ColorState';
import { ExpressionState } from './ExpressionState';
import { FontState } from './FontState';
import { NumberState } from './NumberState';
import { StageItemState } from './StageItemState';
import { StringState } from './StringState';

// TODO
export class StageItemStateService {

  async createState(type: ParamDefinitionType, textValue: string): Promise<StageItemState<unknown, unknown>> {
    let state: StageItemState<unknown, unknown> | null = null;
    switch (type) {
    case 'color': state = new ColorState(); break;
    case 'expression': state = new ExpressionState(); break;
    case 'number': state = new NumberState(); break;
    case 'font': state = new FontState(); break;
    case 'selection':
    case 'string':
    default: state = new StringState(); break;
    }
    await state.setTextValue(textValue);
    return state;
  }

}

export const stageItemStateService = new StageItemStateService();
