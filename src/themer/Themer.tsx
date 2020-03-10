import * as React from 'react';

import { Collapsable } from '../ui/Collapsable';
import { ColorInput } from '../ui/input/ColorInput';
import { Color } from '../datatypes/Color';

import './Themer.styl';


export class Themer extends React.Component<{}, { show: boolean }> {

  constructor(props: {}) {
    super(props);
    this.state = { show: false }
  }

  render() {
    return (
      <div className="overlay themer">
        <h1
          className={`action ${this.state.show ? 'edit-mode' : ''}`}
          onClick={() => this.setState(state => ({ show: !state.show }))}>
          theme
        </h1>
        <Collapsable show={this.state.show}>
          <ColorInput
            label="accent"
            rangeValue={this.getColor('accent').get()}
            onChange={c => this.setColor('accent', new Color(c))}
          />
        </Collapsable>
      </div>
    );
  }

  private setColor(id: string, c: Color) {
    (document.querySelector(':root') as any).style.setProperty(`--${id}Color`, c.toString());
    this.forceUpdate();
  }

  private getColor(id: string): Color {
    return new Color(
      getComputedStyle(document.querySelector(':root')).getPropertyValue(`--${id}Color`).trim()
    );
  }
}
