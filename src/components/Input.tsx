import * as React from 'react';

import './Input.styl';
import { Color } from '../datatypes/Color';


interface Props {
  type?: InputType,
  label?: string,
  valueLabel?: string,
  value?: any,
  min?: number,
  max?: number,
  onChange: (value: any) => void,
  className?: string,
  step?: number,
}

interface State { 
  focus: boolean[];
}

export enum InputType { RANGE, TEXT, COLOR }
enum InputColor { NONE, RED, GREEN, BLUE }

export class Input extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      focus: []
    };
  }

  static defaultProps = {
    type: InputType.TEXT,
    label: '',
    step: 1
  }

  getInputField(value: any, inputColor: InputColor): React.ReactNode {
    return <div className="input-value" key={inputColor}>
      <input
        className={[
          typeof this.props.className !== 'undefined' ? this.props.className : "",
          inputColor !== InputColor.NONE ? "color-input color-input-" + InputColor[inputColor].toLowerCase() : "",
          this.state.focus[inputColor] ? "focus" : ""
        ].join(" ")}
        type={InputType[this.props.type === InputType.COLOR ? InputType.RANGE : this.props.type].toLowerCase()}
        onMouseDown={() => this.setState(state => {let tmp = [...state.focus]; tmp[inputColor] = true; return {focus: tmp};})}
        onMouseUp={() => this.setState(state => {let tmp = [...state.focus]; tmp[inputColor] = false; return {focus: tmp};})}
        onChange={(e) => {
          let newValue: any = e.target.value;
          if (this.props.type === InputType.COLOR) {
            newValue =
              newValue < 0 ? -0x80000000 | this.props.value
                : newValue > 0xff ? 0x1000000 | this.props.value
                  : inputColor === InputColor.RED ? (this.props.value & 0x00ffff | ((Number(newValue) & 0xff) << 16))
                    : inputColor === InputColor.GREEN ? (this.props.value & 0xff00ff | ((Number(newValue) & 0xff) << 8))
                      : inputColor === InputColor.BLUE ? (this.props.value & 0xffff00 | ((Number(newValue) & 0xff) << 0))
                        : undefined;
          }
          this.props.onChange(this.props.type === InputType.RANGE ? Number(newValue) : newValue)
        }}
        value={typeof value !== 'undefined' ? value : ''}
        min={this.props.type === InputType.COLOR ? -1 : this.props.min}
        max={this.props.type === InputType.COLOR ? 0x100 : this.props.max}
        step={this.props.step}
      />
      {this.props.type !== InputType.TEXT && <output>{
        this.props.type === InputType.COLOR ?
          (value < 0 ? 'transparent' : 0xff < value ? 'random' : value)
          : this.props.valueLabel
      }</output>}
    </div>
  }

  render() {
    return <div className={['input', InputType[this.props.type === InputType.COLOR ? InputType.RANGE : this.props.type].toLowerCase()].join(' ')}>
      <label className={(this.props.value === "" || typeof this.props.value === "undefined")
        && this.props.type === InputType.TEXT ? "input-empty" : ""} >
        {this.props.label}
      </label>
      <div className="input-container">
        {(this.props.type === InputType.COLOR ? [InputColor.RED, InputColor.GREEN, InputColor.BLUE] : [InputColor.NONE]).map((c: InputColor, i: number) =>
          this.getInputField(c === InputColor.NONE ? this.props.value
            : this.props.value < 0 ? this.props.value : this.props.value > 0xffffff ? 0x100 : this.props.value >> (2 - i) * 8 & 0xff, c)
        )}
      </div>
    </div>
  }
}