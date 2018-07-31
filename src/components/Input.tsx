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

export enum InputType { RANGE, TEXT }

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

  getInputField() {
    return <div className={['input', InputType[this.props.type].toLowerCase()].join(' ')}>
      <label
        className={(this.props.value === "" || typeof this.props.value === "undefined")
          && this.props.type === InputType.TEXT ? "input-empty" : ""}
      >
        {this.props.label}
      </label>
      <div className="input-wrapper">
        <input
          className={typeof this.props.className !== 'undefined' ? this.props.className : ''}
          type={InputType[this.props.type].toLowerCase()}
          onChange={(e) => this.props.onChange(this.props.type === InputType.RANGE ? Number(e.target.value) : e.target.value)}
          value={typeof this.props.value !== 'undefined' ? this.props.value : ''}
          min={this.props.min}
          max={this.props.max}
          step={this.props.step}
        />
      </div>
      {this.props.type === InputType.RANGE && <output>{this.props.valueLabel}</output>}
    </div>
  }

  render() {
    return (
      <div>{this.getInputField()}</div>
    );
  }
}