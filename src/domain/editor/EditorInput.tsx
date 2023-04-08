import React from 'react';

import { InputType, Input } from '../../ui/input/Input';

import './EditorInput.styl';

export interface Props {
  inputType: InputType;
  label: string;
  output: string;
  value?: any;
  min?: number;
  max?: number;
  step?: number;
  options?: any[];
  valid?: boolean;
  onChange?: (value: any) => void;
}

export class EditorInput extends React.Component<Props> {
  render() {
    return (
      <div className="draw-config-input">
        <div>
          <Input
            onChange={(textValue: any) => this.props.onChange && this.props.onChange(textValue)}
            label={this.props.label}
            className={this.props.valid ? '' : 'invalid range-invalid'}
            output={this.props.output}
            options={this.props.options}
            value={this.props.value}
            type={this.props.inputType}
            min={this.props.min}
            max={this.props.max}
            step={this.props.step}
          />
        </div>
      </div>
    );
  }
}
