import { ParamDefinitionType } from '../generator/SvgGenerator';
import { ColorState } from './ColorState';
import { ExpressionState } from './ExpressionState';
import { FontState } from './FontState';
import { NumberState } from './NumberState';
import { ParameterState } from './ParameterState';
import { StringState } from './StringState';
import { DistributionState } from './DistributionState';

export async function createParameterState(type: ParamDefinitionType, textValue: string): Promise<ParameterState<unknown, unknown>> {
  let state: ParameterState<unknown, unknown> | null = null;
  switch (type) {
  case 'color': state = new ColorState(); break;
  case 'distribution': state = new DistributionState(); break;
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
