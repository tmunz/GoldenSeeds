import React, { useState, useEffect, useCallback } from 'react';

import { Collapsable } from '../ui/Collapsable';
import { Color } from '../datatypes/Color';
import { ColorInput } from '../ui/input/color/ColorInput';
import { randomInt } from '../utils/Random';
import { DarkThemeToggle } from './DarkThemeToggle';

import './Themer.styl';


export function Themer() {
  const root: HTMLElement = document.querySelector(':root') as HTMLElement;
  const [accentColor, setAccentColor] = useState<Color>(new Color(getColorValue('accent')));
  const [darkTheme, setDarkTheme] = useState<boolean>(!isLightThemeActive());
  const [display, setDisplay] = useState<boolean>(false);

  const setColorValue = useCallback((id: string, c: Color) => {
    root.style.setProperty(`--${id}Color`, c.getRgbString(randomInt()));
  }, [root.style]);

  useEffect(() => {
    setColorValue('accent', accentColor);
  }, [accentColor, setColorValue]);

  useEffect(() => {
    darkTheme ? root.classList.remove('light-theme') : root.classList.add('light-theme');
  }, [darkTheme, root.classList]);

  function getColorValue(id: string): string {
    return getComputedStyle(root).getPropertyValue(`--${id}Color`).trim();
  }

  function isLightThemeActive(): boolean {
    return root.classList.contains('light-theme');
  }

  return (
    <div className="themer">
      <button
        className={`action ${display ? 'edit-mode' : ''}`}
        onClick={() => setDisplay(!display)}
      >
        <h1>theme</h1>
      </button>
      <Collapsable show={display}>
        <label htmlFor="dark-theme">dark mode</label>
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
