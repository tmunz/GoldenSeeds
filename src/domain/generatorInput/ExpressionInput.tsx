import { SvgGeneratorInput } from './SvgGeneratorInput';
import { ParamDefinition, ParamDefinitionMinMaxStep } from '../generator/SvgGenerator';
import { StageItemState } from '../stage/Stage';
import { InputType } from '../../ui/input/Input';

export class ExpressionInput extends SvgGeneratorInput<
  (n: number, items: number, itemSize: (n: number) => number) => number
> {
  inputConfig = (
    definition: ParamDefinition,
    state: StageItemState<(n: number, items: number, itemSize: (n: number) => number) => number>,
  ) => {
    // const regexResult = state.rawValue.match(/^\s*(n\s\*\s*(.*\S)?)\s*$/);
    // const nMode: boolean = regexResult ? true : false;
    // const controls = [this.generateNControl(stage, nLessValue, nMode)];

    return {
      value: state.rawValue,
      inputType: InputType.EXTENDED_RANGE,
      canExpertMode: true,
      min: (definition as ParamDefinitionMinMaxStep)?.min,
      max: (definition as ParamDefinitionMinMaxStep)?.max,
      step: (definition as ParamDefinitionMinMaxStep)?.step,
      // controls,
      // convertToString: (i: any) => `${nMode && typeof i === 'number' ? 'n * ' : ''}${i}`,
    };
  };

  /*private generateNControl(stage: number, nLessValue: string, active: boolean): JSX.Element {
    return <div
      key={this.name}
      className={['n-mode-selector', active ? 'active' : ''].join(' ')}
      onClick={() => { stageService.setConfigValue(stage, this.name, (active ? '' : 'n * ') + nLessValue); }}
    >
      n
    </div >;
  }*/
}
