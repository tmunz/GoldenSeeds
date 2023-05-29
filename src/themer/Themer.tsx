import React from 'react';

import { Collapsable } from '../ui/Collapsable';
import { Color } from '../datatypes/Color';
import { ColorSelector } from '../ui/input/ColorSelector';

import './Themer.styl';

export class Themer extends React.Component<{}, { show: boolean }> {
  root: HTMLElement = document.querySelector(':root') as HTMLElement;

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
              lightThemeActive ? this.root.classList.remove('light-theme') : this.root.classList.add('light-theme');
              this.forceUpdate();
            }}
          >
            {lightThemeActive ? 'dark' : 'light'}
          </div>
          <ColorSelector
            label="accent"
            value={this.getColor('accent')}
            onChange={(c) => this.setColor('accent', new Color(c))}
            simple
          />
        </Collapsable>
      </div>
    );
  }

  private setColor(id: string, c: Color) {
    (document.querySelector(':root') as HTMLElement).style.setProperty(`--${id}Color`, c.getRgbString());
    this.forceUpdate();
  }

  private getColor(id: string): string {
    return getComputedStyle(document.querySelector(':root')).getPropertyValue(`--${id}Color`).trim();
  }
}
