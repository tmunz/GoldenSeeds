import React, { useState, useEffect } from 'react';

import { Collapsable } from '../ui/Collapsable';
import { Color } from '../datatypes/Color';
import { ColorInput } from '../ui/input/color/ColorInput';
import { randomInt } from '../utils/Random';

import './Themer.styl';
import { DarkThemeToggle } from './DarkThemeToggle';

export function Themer() {
  const root: HTMLElement = document.querySelector(':root') as HTMLElement;
  const [accentColor, setAccentColor] = useState<Color>(new Color(getColorValue('accent')));
  const [darkTheme, setDarkTheme] = useState<boolean>(!isLightThemeActive());
  const [display, setDisplay] = useState<boolean>(false);

  useEffect(() => {
    setColorValue('accent', accentColor);
  }, [accentColor]);

  useEffect(() => {
    darkTheme ? root.classList.remove('light-theme') : root.classList.add('light-theme');
  }, [darkTheme]);

  function setColorValue(id: string, c: Color) {
    root.style.setProperty(`--${id}Color`, c.getRgbString(randomInt()));
  }

  function getColorValue(id: string): string {
    return getComputedStyle(root).getPropertyValue(`--${id}Color`).trim();
  }

  function isLightThemeActive(): boolean {
    return root.classList.contains('light-theme');
  }

  return (
    <div className="themer">
      <h1
        className={`action ${display ? 'edit-mode' : ''}`}
        onClick={() => setDisplay(!display)}
      >
        theme
        </h1>
      <Collapsable show={display}>
        <label>dark</label>
        <DarkThemeToggle
          active={darkTheme}
          onChange={(active) => setDarkTheme(active)}
        />
        <ColorInput
          label="accent"
          value={accentColor.getAcn()}
          onChange={(c) => setAccentColor(new Color(c))}
          alphaDisabled
        />
      </Collapsable>
    </div>
  );
}
