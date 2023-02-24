import React from 'react';

import { Collapsable } from '../ui/Collapsable';
import { ColorInput } from '../ui/input/ColorInput';
import { Color } from '../datatypes/Color';

import './Themer.styl';

export class Themer extends React.Component<{}, { show: boolean }> {
  root: HTMLElement = document.querySelector(':root');

  constructor(props: {}) {
    super(props);
    this.state = { show: false };
  }

  render() {
    const lightThemeActive = this.root.classList.contains('light-theme');

    return (
      <div className="themer">
        <h1
          className={`action ${this.state.show ? 'edit-mode' : ''}`}
          onClick={() => this.setState((state) => ({ show: !state.show }))}
        >
          theme
        </h1>
        <Collapsable show={this.state.show}>
          <div
            className="action"
            onClick={() => {
              lightThemeActive
                ? this.root.classList.remove('light-theme')
                : this.root.classList.add('light-theme');
              this.forceUpdate();
            }}
          >
            {lightThemeActive ? 'dark' : 'light'}
          </div>
          <ColorInput
            label="accent"
            rangeValue={this.getColor('accent').get()}
            onChange={(c) => this.setColor('accent', new Color(c))}
          />
        </Collapsable>
      </div>
    );
  }

  private setColor(id: string, c: Color) {
    (document.querySelector(':root') as HTMLElement).style.setProperty(
      `--${id}Color`,
      c.toString(),
    );
    this.forceUpdate();
  }

  private getColor(id: string): Color {
    return new Color(
      getComputedStyle(document.querySelector(':root'))
        .getPropertyValue(`--${id}Color`)
        .trim(),
    );
  }
}
