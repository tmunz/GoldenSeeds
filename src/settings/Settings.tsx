import { isLocale } from '../i18n/translate';
import { useTranslation } from '../i18n/I18n';
import React, { useState, useEffect, useCallback } from 'react';

import { Collapsable } from '../ui/Collapsable';
import { Color } from '../datatypes/Color';
import { ColorInput } from '../ui/input/color/ColorInput';
import { randomInt } from '../utils/Random';
import { DarkThemeToggle } from './DarkThemeToggle';

import './Settings.css';


export function Settings() {
  const { t, locale, setLocale } = useTranslation();
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
    <div className="settings">
      <button
        aria-expanded={display}
        aria-controls="app-settings"
        className={`action ${display ? 'edit-mode' : ''}`}
        onClick={() => setDisplay(!display)}
      >
        <h1>{t('settings.title')}</h1>
      </button>
      <Collapsable show={display}>
        <div id="app-settings" className="settings-content">
          <label className="settings-field language-selector">
            <span>{t('language.label')}</span>
            <select value={locale} onChange={event => { if (isLocale(event.target.value)) { setLocale(event.target.value); } }}>
              <option value="en" lang="en">English</option>
              <option value="de" lang="de">Deutsch</option>
            </select>
          </label>
          <div className="settings-field">
            <span>{t('theme.dark')}</span>
            <DarkThemeToggle
              active={darkTheme}
              onChange={(active) => setDarkTheme(active)}
            />
          </div>
          <ColorInput
            label={t('theme.accent')}
            value={accentColor}
            onChange={(c) => setAccentColor(c)}
            alphaDisabled
          />
        </div>
      </Collapsable>
    </div>
  );
}
