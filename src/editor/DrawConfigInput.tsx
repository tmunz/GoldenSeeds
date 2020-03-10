import * as React from 'react';

import { InputType, Input } from '../ui/input/Input';

import './DrawConfigInput.styl';


export interface Props {
  label: string;
  textValue: string;
  rangeValue?: number;
  min?: number;
  max?: number;
  step?: number;
  valid?: boolean;
  onChange?: (rawValue: string) => void;
  convertToString?: (value: any) => string;
  controls?: JSX.Element[];
  inputType: InputType;
}


export class DrawConfigInput extends React.Component<Props> {

  render() {
    return (
      <div className="draw-config-input">
        <div>
          <Input
            onChange={(value: any) => this.props.onChange(this.props.convertToString ? this.props.convertToString(value) : `${value}`)}
            label={this.props.label}
            className={this.props.valid ? '' : 'invalid range-invalid'}
            value={this.props.textValue}
            rangeValue={this.props.rangeValue}
            type={this.props.inputType}
            min={this.props.min}
            max={this.props.max}
            step={this.props.step}
            random={true}
          />
        </div>
        {this.props.controls}
      </div >
    );
  }
}
