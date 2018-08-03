import * as React from 'react';

import './Input.styl';


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

interface State { }

export enum InputType { RANGE, TEXT, COLOR }

export class Input extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  static defaultProps = {
    type: InputType.TEXT,
    label: '',
    step: 1
  }

  getInputField(value: any, colorType?: number): React.ReactNode {
    return <div className="input-value">
      <input
        className={[typeof this.props.className !== 'undefined' ? this.props.className : ""].join(" ")}
        type={InputType[this.props.type === InputType.COLOR ? InputType.RANGE : this.props.type].toLowerCase()}
        onChange={(e) => {
          let newValue: any = e.target.value;
          if (this.props.type === InputType.COLOR) {
            newValue =
              newValue < 0 ? -0x80000000 | this.props.value
                : newValue > 0xff ? 0x1000000 | this.props.value
                  : colorType === 0 ? (this.props.value & 0x00ffff | ((Number(newValue) & 0xff) << 16))
                    : colorType === 1 ? (this.props.value & 0xff00ff | ((Number(newValue) & 0xff) << 8))
                      : colorType === 2 ? (this.props.value & 0xffff00 | ((Number(newValue) & 0xff) << 0))
                        : undefined;
          }
          this.props.onChange(this.props.type === InputType.RANGE ? Number(newValue) : newValue)
        }}
        value={typeof value !== 'undefined' ? value : ''}
        min={this.props.type === InputType.COLOR ? -1 : this.props.min}
        max={this.props.type === InputType.COLOR ? 0x100 : this.props.max}
        step={this.props.step}
      />
      {this.props.type !== InputType.TEXT && <output>{this.props.type === InputType.COLOR ? value : this.props.valueLabel}</output>}
    </div>
  }

  render() {
    return <div className={['input', InputType[this.props.type === InputType.COLOR ? InputType.RANGE : this.props.type].toLowerCase()].join(' ')}>
      <label className={(this.props.value === "" || typeof this.props.value === "undefined")
        && this.props.type === InputType.TEXT ? "input-empty" : ""} >
        {this.props.label}
      </label>
      <div className="input-container">
        {(this.props.type === InputType.COLOR ? [0, 1, 2] : [undefined]).map((i: number) =>
          this.getInputField(this.props.type === InputType.COLOR ?
            this.props.value < 0 ? this.props.value : this.props.value > 0xffffff ? 0x100 : this.props.value >> (2 - i) * 8 & 0xff
            : this.props.value, i)
        )}
      </div>
    </div>
  }
}