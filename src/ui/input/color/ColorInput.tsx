import React, { useState, useEffect, ClipboardEvent, useRef, ChangeEvent } from 'react';
import { Color, ColorValue } from '../../../datatypes/Color';
import { CarouselSelector } from '../../CarouselSelector';
import { ColorInputConfig } from './color-input-config/ColorInputConfig';
import { HueColorInputConfig } from './color-input-config/HueColorInputConfig';
import { SaturationColorInputConfig } from './color-input-config/SaturationColorInputConfig';
import { LightnessColorInputConfig } from './color-input-config/LightnessColorInputConfig';
import { AlphaColorInputConfig } from './color-input-config/AlphaColorInputConfig';
import { RedColorInputConfig } from './color-input-config/RedColorInputConfig';
import { GreenColorInputConfig } from './color-input-config/GreenColorInputConfig';
import { BlueColorInputConfig } from './color-input-config/BlueColorInputConfig';

import './ColorInput.styl';


type ColorMode = 'rgb' | 'hsl' | 'random';
type InputData = ColorInputConfig & { value: string }

export function ColorInput(props: { value: string, onChange: (acn: string) => void }) {

  const COLOR_MODES: ColorMode[] = ['rgb', 'hsl', 'random'];
  const RANDOM_GRADIENT: string = "linear-gradient(30deg, rgb(131,58,180) 0%, rgb(253,29,29) 50%, rgb(222, 205, 135) 100%)";
  const ref = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const [colorMode, setColorMode] = useState<ColorMode>('' as any);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [color, setColor] = useState<Color>(new Color('#000000'));
  const [colorValid, setColorValid] = useState<boolean>(true);
  const [inputData, setInputData] = useState<InputData[]>(colorToInputData(color, colorMode));

  useEffect(() => {
    const c = new Color(props.value);
    //if (inputDataToColor().getAcn() !== c.getAcn()) {
    setColorMode(c.isRandom() ? 'random' : 'rgb');
    setInputData(colorToInputData(c, colorMode));
    setColor(c);
    //}
  }, [props.value]);

  useEffect(() => {
    setInputData(colorToInputData(color, colorMode));
  }, [colorMode]);

  useEffect(() => {
    if (selectedIndex !== null) {
      const inputIndex = selectedIndex ?? 0;
      const input = refs.current[inputIndex];
      if (input && cursorPosition !== null) {
        input.setSelectionRange(cursorPosition, cursorPosition);
        input.focus();
      }
    }
  }, [refs, selectedIndex, cursorPosition, inputData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      console.log(ref.current, ref.current && ref.current.contains(event.target as any));
      if (ref.current && event && !ref.current.contains(event.target as any)) {
        setSelectedIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  useEffect(() => {
    setSelectedIndex(null);
  }, [colorMode]);

  useEffect(() => {
    if (selectedIndex === null) {
      setCursorPosition(null);
    }
  }, [selectedIndex]);

  function calculateInputLength(config?: { max?: number, base?: number }): number {
    const max = config?.max !== undefined ? config.max : 100;
    const base = config?.base !== undefined ? config.base : 10;
    return Math.ceil(Math.log(max + 1) / Math.log(base));
  }

  function prepareField(s: string, inputLength: number): string {
    const prepped = s.padStart(inputLength, '0');
    return prepped.slice(-inputLength);
  }

  function colorToInputData(c: Color, mode: ColorMode): InputData[] {
    switch (mode) {
      case 'random': return ['', '', ''].map((key, i) => ({
        name: key,
        value: i === 0 ? 'ra' : i === 1 ? 'nd' : i === 2 ? 'om' : '',
        gradient: [],
      }));
      case 'hsl': return [HueColorInputConfig, SaturationColorInputConfig, LightnessColorInputConfig, AlphaColorInputConfig].map(config => {
        const v = (c.getHsla() as any)[config.name];
        const a = Math.round(config.name === 'a' ? v * 100 : v);
        return {
          ...config, value: prepareField((isFinite(a) ? a : 100).toString(config.base),
            calculateInputLength(config))
        };
      });
      case 'rgb':
      default: return [RedColorInputConfig, GreenColorInputConfig, BlueColorInputConfig, AlphaColorInputConfig].map(config => {
        const v = (c.getRgba() as any)[config.name];
        const a = Math.round(config.name === 'a' ? v * 100 : v);
        return {
          ...config, value: prepareField((isFinite(a) ? a : 100).toString(config.base),
            calculateInputLength(config))
        };
      });
    }
  }

  function inputDataToColor() {
    const a = inputData[3] !== undefined ? (Number.parseInt(inputData[3].value) / 100) : 100;
    const colorValue: ColorValue = colorMode === 'rgb' ? {
      r: Number.parseInt(inputData[0].value, 0x10),
      g: Number.parseInt(inputData[1].value, 0x10),
      b: Number.parseInt(inputData[2].value, 0x10),
      a,
    } : colorMode === 'hsl' ? {
      h: Number.parseInt(inputData[0].value),
      s: Number.parseInt(inputData[1].value),
      l: Number.parseInt(inputData[2].value),
      a,
    } : colorMode;
    return new Color(colorValue);
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text/plain")
    setInputData(colorToInputData(new Color(pasted), colorMode));
  };

  function prepareDelete(event: React.KeyboardEvent<HTMLInputElement>) {
    const code = event.keyCode || event.charCode;
    if (code === 8 || code === 46) {
      event.preventDefault();
    }
  }

  function handleDelete(event: React.KeyboardEvent<HTMLInputElement> & ChangeEvent<HTMLInputElement>, key: number) {
    const code = event.keyCode || event.charCode;
    const s = event.target.value ?? '';
    const index = event.target.selectionStart ?? 0;
    switch (code) {
      case 8:
        index > 0 && update(`${s.slice(0, index - 1)}0${s.slice(index)}`, key, index - 1);
        break;
      case 46:
        update(`${s.slice(0, index)}0${s.slice(index + 1)}`, key, index + 1);
        break;
    }
  }

  function handleRangeInputChange(event: ChangeEvent<HTMLInputElement>, key: number) {
    const n = Number.parseInt(event.target.value);
    update(n.toString(inputData[key].base ?? 10), key, 0);
  }

  function handleTextInputChange(event: ChangeEvent<HTMLInputElement>, key: number) {
    const s = event.target.value ?? '';
    const index = event.target.selectionStart ?? 0;
    update(`${s.slice(0, index)}${s.slice(index + 1)}`, key, index);
  }

  function handleClick() {
    if (colorMode === 'random') {
      const c = color;
      c.setRandom();
      props.onChange(c.getAcn());
    }
  }

  function adjustCursorPosition(inputLength: number, cursor: number, key: number) {
    if (inputLength !== undefined && inputLength <= cursor) {
      const nextInputField = refs.current[key + 1];
      if (nextInputField !== undefined && nextInputField !== null) {
        setSelectedIndex(key + 1);
        setCursorPosition(0);
      } else {
        setCursorPosition(cursor);
      }
    } else {
      const nextInputField = refs.current[key];
      if (nextInputField !== undefined && nextInputField !== null) {
        setSelectedIndex(key);
        setCursorPosition(cursor);
      }
    };
  }

  function update(s: string, key: number, cursorPosition: number) {
    const nextString = prepareField(s, calculateInputLength(inputData[key]));
    const nextInputDatas: InputData[] = [...inputData];
    nextInputDatas[key].value = nextString;
    setInputData(nextInputDatas);
    const currentInputData = selectedIndex !== null ? nextInputDatas[selectedIndex] : undefined;
    const inputLength = calculateInputLength(currentInputData);
    adjustCursorPosition(inputLength, cursorPosition, key);
    const c = inputDataToColor();
    if (c.isValid()) {
      setColorValid(true);
      setColor(c);
      props.onChange(c.getAcn());
    } else {
      setColorValid(false);
    }
  };

  const currentInputData = inputData[selectedIndex ?? 0];

  return <div className="color-input" ref={ref}>
    <div className={`color-input-main${colorValid ? '' : ' color-input-invalid'}`}>
      <div className="color-input-range"
        style={{
          opacity: selectedIndex !== null ? 1 : 0,
          background: `linear-gradient(90deg, 
            ${currentInputData.gradient.map((g, i, arr) => `${new Color({ ...(colorMode === 'hsl' ? color.getHsla() : color.getRgba()), ...g }).getRgbaString()} ${i / (arr.length - 1) * 100}% `).join(',')}`
        }} >
        <input
          type="range"
          min={currentInputData.min}
          max={currentInputData.max}
          value={Number.parseInt(currentInputData.value, currentInputData.base)}
          onChange={(event) => handleRangeInputChange(event, selectedIndex ?? 0)}
        />
      </div>
      <div className={`color-input-field${selectedIndex !== null ? ' color-input-range-active' : ''}`}
        style={{ background: color.isRandom() ? RANDOM_GRADIENT : color.getRgbaString(), }}>
        {inputData.map((entry: InputData, key: number) =>
          <div className="color-input-entry">
            <label>{entry.name}</label>
            <input
              key={key}
              ref={e => refs.current[key] = e}
              style={{ color: color.getHsla().l < 50 ? '#FFF' : '#000' }}
              value={entry.value}
              onPaste={onPaste}
              onSelect={(event) => { setSelectedIndex(key); setCursorPosition((event.currentTarget as any).selectionStart); }}
              onKeyDown={prepareDelete}
              onKeyUp={(event) => handleDelete(event as any, key)}
              onChange={(event) => handleTextInputChange(event, key)}
              onClick={() => handleClick()}
              type={colorMode === 'random' ? 'button' : 'text'}
            />
            <label>{entry.unit}</label>
          </div>
        )}
      </div>
    </div>
    <CarouselSelector
      items={COLOR_MODES.map(c => ({ name: c.toString(), svg: null }))}
      selected={colorMode}
      select={(c) => setColorMode(c as ColorMode)}
    />
  </div>
}