import * as React from 'react';

import { DrawConfigAttribute, DrawConfigType, DrawConfig, DrawType } from '../datatypes/DrawConfig';
import { InputType, Input } from './Input';
import { MathUtils } from '../helper/MathUtils';
import { DirectionSelector, Direction } from './DirectionSelector';

import './DrawConfigInput.styl';
import { Color } from '../datatypes/Color';


interface Props {
  attribute: DrawConfigAttribute
  isParsable: boolean;
  value: any;
  onChange: (value: string) => any;
}

interface State {
  expertMode: boolean;
}


export class DrawConfigInput extends React.Component<Props, State> {

  nMode: boolean;           // props.value
  goldenRatioMode: boolean; // props.value
  isRangeable: boolean;     // props.value
  valueRange: number;       // props.value
  valueText: string;        // props.value
  inputType: InputType;     // state.expertMode

  static NO_EXPERT_MODE_ATTRIBUTES: DrawConfigAttribute[] = [
    DrawConfigAttribute.NAME, DrawConfigAttribute.TYPE,
    DrawConfigAttribute.ITEMS, DrawConfigAttribute.ITEM_CORNERS,
  ];

  static N_ABLE_ATTRIBUTES: DrawConfigAttribute[] = [
    DrawConfigAttribute.ANGLE, DrawConfigAttribute.DISTANCE,
    DrawConfigAttribute.ITEM_ANGLE, DrawConfigAttribute.ITEM_SIZE, DrawConfigAttribute.ITEM_RATIO
  ];

  static GOLDEN_RATIO_ATTRIBUTES: DrawConfigAttribute[] = [
    DrawConfigAttribute.ANGLE, DrawConfigAttribute.DISTANCE,
    DrawConfigAttribute.ITEM_ANGLE, DrawConfigAttribute.ITEM_SIZE, DrawConfigAttribute.ITEM_RATIO
  ];

  constructor(props: Props) {
    super(props);
    this.state = {
      expertMode: false
    };
    this.update(props);
  }

  componentWillReceiveProps(nextProps: Props) {
    this.update(nextProps);
  }

  private update(props: Props) {
    this.updateInputType(this.state.expertMode, DrawConfigAttribute.getType(props.attribute));
    let drawConfigType: DrawConfigType = DrawConfigAttribute.getType(props.attribute);

    if (typeof props.value !== "undefined") {
      let valueRange = Number(props.value);
      let valueText = props.value.toString();

      if (drawConfigType === DrawConfigType.COLOR) {
        let color = Color.convertToColor(props.value);
        if (color !== null) {
          valueText = isFinite(props.value) ? color.toString() : props.value;
          valueRange = color.toRgb();
        }
      }

      if (props.attribute === DrawConfigAttribute.TYPE) {
        valueText = DrawType.toString(valueRange).toLocaleLowerCase();
      }

      let valueTextWithoutN = this.valueTextWithoutN(valueText);
      this.nMode = valueText !== valueTextWithoutN;
      if (this.nMode === true) {
        valueRange = typeof valueTextWithoutN === 'undefined' ? 1 : Number(valueTextWithoutN); 
        //IMPROVEMENT: use eval  resp. somehow convertToExpression instead of Number(...)
      }

      this.goldenRatioMode = valueText.indexOf('goldenRatio') >= 0 ||
        (drawConfigType === DrawConfigType.ANGLE_EXPRESSION && valueText.indexOf('' + 360 / MathUtils.goldenRatio) >= 0)
        || valueText.indexOf('' + MathUtils.goldenRatio) >= 0;
      this.isRangeable = isFinite(valueRange);

      this.valueRange = valueRange;
      this.valueText = valueText;
    }
  }

  private valueTextWithoutN(value: any): string {
    let regexResult = ('' + value).match(/^(n)\s*(\*\s*(.*))?$/);
    return regexResult === null ? '' + value : regexResult[3];
  }

  private updateInputType(expertMode: boolean, drawConfigType: DrawConfigType) {
    let tmp = InputType.TEXT;
    if (expertMode) {
      if (drawConfigType === DrawConfigType.NUMBER) {
        tmp = InputType.RANGE;
      }
    } else {
      if (drawConfigType !== DrawConfigType.STRING && drawConfigType !== DrawConfigType.OBJECT) {
        tmp = InputType.RANGE;
      }
    }
    this.inputType = tmp;
  }

  createInputField(): React.ReactNode {
    let attribute = this.props.attribute;
    let drawConfigType: DrawConfigType = DrawConfigAttribute.getType(attribute);

    return <Input
      key={attribute}
      value={this.inputType === InputType.RANGE ? this.valueRange.toString() : this.valueText}
      onChange={value => this.props.onChange(this.nMode && this.inputType == InputType.RANGE ? 'n * ' + value : value)}
      label={DrawConfig.getName(attribute)}
      className={[this.props.isParsable ? "" : "invalid", this.isRangeable ? "" : "range-invalid"].join(" ")}
      valueLabel={this.valueText}
      type={this.inputType}
      min={
        drawConfigType === DrawConfigType.COLOR ? -1
          : attribute === DrawConfigAttribute.ITEMS ? 1
            : attribute === DrawConfigAttribute.ITEM_SIZE ? 0.05
              : 0
      }
      max={
        drawConfigType === DrawConfigType.COLOR ? 0x1000000
          : attribute === DrawConfigAttribute.TYPE || attribute === DrawConfigAttribute.CUT_RATIO_0
            || attribute === DrawConfigAttribute.CUT_RATIO_1 ? 1
            : attribute === DrawConfigAttribute.ITEM_RATIO ? 2
              : attribute === DrawConfigAttribute.DISTANCE ? this.nMode ? 1 : 100
                : attribute === DrawConfigAttribute.ITEM_SIZE ? 10
                  : attribute === DrawConfigAttribute.ITEM_CORNERS ? MathUtils.fib(8)
                    : attribute === DrawConfigAttribute.ITEMS ? MathUtils.fib(16)
                      : attribute === DrawConfigAttribute.ANGLE || attribute === DrawConfigAttribute.ITEM_ANGLE ? 360
                        : undefined
      }
      step={
        attribute === DrawConfigAttribute.ITEM_RATIO || attribute === DrawConfigAttribute.CUT_RATIO_0
          || attribute === DrawConfigAttribute.ITEM_SIZE || attribute === DrawConfigAttribute.CUT_RATIO_1 ? 0.05
          : attribute === DrawConfigAttribute.DISTANCE ? this.nMode ? 0.01 : 1
            : undefined
      }
    />
  }

  render() {
    let drawConfigType: DrawConfigType = DrawConfigAttribute.getType(this.props.attribute);
    return (
      <div className="draw-config-input">
        {this.createInputField()}
        {!this.state.expertMode && DrawConfigInput.GOLDEN_RATIO_ATTRIBUTES.indexOf(this.props.attribute) >= 0 &&
          <div
            className={["golden-ratio-selector", this.goldenRatioMode ? "active" : ""].join(" ")}
            onClick={() => this.props.onChange((this.nMode ? 'n * ' : '') + (drawConfigType === DrawConfigType.ANGLE_EXPRESSION ? '360/goldenRatio' : 'goldenRatio'))}
          >
            &Phi;
          </div>
        }
        {!this.state.expertMode && DrawConfigInput.N_ABLE_ATTRIBUTES.indexOf(this.props.attribute) >= 0 &&
          <div
            className={["n-mode-selector", this.nMode ? "active" : ""].join(" ")}
            onClick={() => {
              this.props.onChange(this.nMode ? this.valueTextWithoutN(this.props.value) : 'n * ' + this.props.value);
            }}
          >
            n
          </div>
        }
        {
          DrawConfigInput.NO_EXPERT_MODE_ATTRIBUTES.indexOf(this.props.attribute) < 0 &&
          <DirectionSelector
            className="expert-mode-selector"
            direction={this.state.expertMode ? Direction.LEFT : Direction.RIGHT}
            onClick={() => this.setState(state => {
              this.updateInputType(!state.expertMode, DrawConfigAttribute.getType(this.props.attribute));
              return { expertMode: !state.expertMode }
            })}
          />
        }
      </div >
    );
  }
}