import React from 'react';
import { RangeInput } from './RangeInput';
import { TextInput } from './TextInput';

import './ExtendedRangeInput.styl';

export interface Props {
  className?: string;
  label?: string;
  value?: string;
  rangeValue?: number;
  onChange: (value: any) => void;
  min?: number;
  max?: number;
  step?: number;
}

export class ExtendedRangeInput extends React.Component<Props> {
  render() {
    return (
      <div className="extended-range-input">
        <TextInput {...this.props} />
        <RangeInput {...{ ...this.props, label: undefined, value: undefined }} />
      </div>
    );
  }
}
