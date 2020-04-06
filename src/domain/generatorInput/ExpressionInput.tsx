import { SvgGeneratorInput } from './SvgGeneratorInput';
import { ParamDefinition } from '../generator/SvgGenerator';
import { StageState } from '../stage/Stage';
import { InputType } from '../../ui/input/Input';


export class ExpressionInput extends SvgGeneratorInput<(n: number, items: number, itemSize: (n: number) => number) => number> {

  inputConfig = (stageId: number, name: string, definition: ParamDefinition,
    state: StageState<(n: number, items: number, itemSize: (n: number) => number) => number>) => {

    const regexResult = state.rawValue.match(/^\s*(n\s\*\s*(.*\S)?)\s*$/);
    const nMode: boolean = regexResult ? true : false;
    const nLessValue: string = nMode ? regexResult[2] : state.rawValue;
    const rangeValue: number = parseFloat(nLessValue);
    // const controls = [this.generateNControl(stage, nLessValue, nMode)];

    return {
      textValue: state.rawValue,
      inputType: InputType.EXTENDED_RANGE,
      canExpertMode: true,
      rangeValue,
      // controls,
      convertToString: (i: any) => `${nMode && typeof i === 'number' ? 'n * ' : ''}${i}`,
    };
  }

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
