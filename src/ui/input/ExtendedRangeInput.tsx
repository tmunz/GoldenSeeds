import React from 'react';
import { RangeInput } from './RangeInput';
import { TextInput } from './TextInput';

import './Input.styl';
import './ExtendedRangeInput.styl';

export interface Props {
  className?: string;
  label?: string;
  value?: any;
  output?: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
}

export class ExtendedRangeInput extends React.Component<Props> {
  render() {
    return (
      <div className="extended-range-input">
        <TextInput {...this.props} />
        <RangeInput
          {...{
            ...this.props,
            value: Number.parseFloat(this.props.value) ?? 0,
            label: undefined,
            output: undefined,
            onChange: (value) => this.props.onChange(`${value}`),
          }}
        />
      </div>
    );
  }
}
