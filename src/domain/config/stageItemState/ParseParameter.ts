import { Color } from '../../../datatypes/Color';
import { ParamDefinition } from '../../generator/SvgGenerator';
import { ColorState } from './ColorState';
import { DistributionState } from './DistributionState';
import { ExpressionState } from './ExpressionState';
import { NumberState } from './NumberState';
import { StringState } from './StringState';
import { StageItemState } from './StageItemState';

/** Parse editor text into fresh state. Selections use zero-based indexes in the editor. */
export function parseParameter(definition: ParamDefinition, text: string): StageItemState<unknown, unknown> | undefined {
  switch (definition.type) {
  case 'number': {
    const value = Number(text);
    if (!text.trim() || !Number.isFinite(value) || definition.validate?.(value) === false) {
      return;
    }
    const state = new NumberState();
    state.setValue(value);
    return state;
  }
  case 'expression': {
    if (!text.trim()) { return; }
    const state = new ExpressionState();
    state.setValue(text, false);
    return state.isValid() ? state : undefined;
  }
  case 'selection': {
    const index = Number(text);
    if (!text.trim() || !Number.isInteger(index) || index < 0 || index >= definition.options.length) {
      return;
    }
    const state = new StringState();
    state.setValue(definition.options[index]);
    return state;
  }
  case 'string': {
    const state = new StringState();
    state.setValue(text);
    return state;
  }
  case 'color': {
    const state = new ColorState();
    state.setValue(new Color(text));
    return state.isValid() ? state : undefined;
  }
  case 'distribution': {
    const state = new DistributionState();
    state.setText(text);
    return state.isValid() ? state : undefined;
  }
  case 'font': return; // Font loading is asynchronous; its editor supplies the resolved font.
  }
}
