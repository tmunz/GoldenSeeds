import React from 'react';
import { RangeInput, Props as RangeInputProps } from './RangeInput';
import { TextInput, Props as TextInputProps } from './TextInput';
import { ColorInput, Props as ColorInputProps } from './ColorInput';
import { ExtendedRangeInput, Props as ExtendedRangeInputProps } from './ExtendedRangeInput';

import './Input.styl';

export enum InputType {
  RANGE = 'range',
  TEXT = 'text',
  COLOR = 'color',
  EXTENDED_RANGE = 'extended-range',
}

type Props = (RangeInputProps | TextInputProps | ColorInputProps | ExtendedRangeInputProps) & {
  type?: InputType;
  value?: any;
  onChange: (value: any) => void;
};

export class Input extends React.Component<Props> {
  render() {
    switch (this.props.type) {
      case InputType.RANGE:
        return <RangeInput {...this.props} />;
      case InputType.COLOR:
        return <ColorInput {...this.props} />;
      case InputType.EXTENDED_RANGE:
        return <ExtendedRangeInput {...this.props} />;
      case InputType.TEXT:
      default:
        return <TextInput {...this.props} />;
    }
  }
}
