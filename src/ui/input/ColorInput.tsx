import React from 'react';
import { RangeInput } from './RangeInput';

import './ColorInput.styl';

export interface Props {
  label?: string;
  value?: string;
  rangeValue?: number;
  random?: boolean;
  onChange: (value: number) => void;
  className?: string;
}

enum InputColor {
  RED = 'red',
  GREEN = 'green',
  BLUE = 'blue',
}

export class ColorInput extends React.Component<Props> {
  render() {
    const value = this.props.rangeValue ?? 0;
    return (
      <div className="input color-input">
        <label>{this.props.label}</label>
        <div className="input-container">
          {[InputColor.RED, InputColor.GREEN, InputColor.BLUE].map((c: InputColor, i: number) =>
            this.getInputField(value < 0 ? value : value > 0xffffff ? 0x100 : (value >> ((2 - i) * 8)) & 0xff, c),
          )}
        </div>
      </div>
    );
  }

  private getInputField(value: any, inputColor?: InputColor): React.ReactNode {
    return (
      <RangeInput
        key={inputColor}
        className={[
          typeof this.props.className !== 'undefined' ? this.props.className : '',
          inputColor ? 'color-input-range-' + inputColor : '',
        ].join(' ')}
        onChange={(n) => this.props.onChange(this.convertValue(n, inputColor))}
        rangeValue={typeof value !== 'undefined' ? value : ''}
        value={value < 0 ? 'transparent' : 0xff < value ? 'random' : value}
        min={-1}
        max={this.props.random ? 0x100 : 0xff}
        step={1}
      />
    );
  }

  private convertValue(channel: any, inputColor?: InputColor): number {
    const value = this.props.rangeValue ?? 0;
    return channel < 0
      ? -0x80000000 | value
      : 0xff < channel
        ? 0x1000000 | value
        : inputColor === InputColor.RED
          ? (value & 0x00ffff) | ((Number(channel) & 0xff) << 16)
          : inputColor === InputColor.GREEN
            ? (value & 0xff00ff) | ((Number(channel) & 0xff) << 8)
            : inputColor === InputColor.BLUE
              ? (value & 0xffff00) | ((Number(channel) & 0xff) << 0)
              : 0;
  }
}
