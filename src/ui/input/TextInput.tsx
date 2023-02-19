import React from 'react';

import './TextInput.styl';

export interface Props {
  label?: string;
  value?: any;
  onChange: (value: string) => void;
  className?: string;
}

export class TextInput extends React.Component<Props> {
  render() {
    const value = this.props.value;
    return (
      <div className="input text-input">
        <input
          className={this.props.className}
          type="text"
          onChange={(e) => this.props.onChange(e.target.value)}
          value={typeof value !== 'undefined' ? value : ''}
        />
        <label
          className={
            value === '' || typeof value === 'undefined' ? 'input-empty' : ''
          }
        >
          {this.props.label}
        </label>
        <div className="indicator" />
      </div>
    );
  }
}
