import React, { useState, useEffect, ClipboardEvent, useRef, ChangeEvent } from 'react';
import { ColorInputConfig } from './color-channel-config/ColorInputConfig';
import { HueColorInputConfig } from './color-channel-config/HueColorInputConfig';
import { SaturationColorInputConfig } from './color-channel-config/SaturationColorInputConfig';
import { LightnessColorInputConfig } from './color-channel-config/LightnessColorInputConfig';
import { AlphaColorInputConfig } from './color-channel-config/AlphaColorInputConfig';
import { RedColorInputConfig } from './color-channel-config/RedColorInputConfig';
import { GreenColorInputConfig } from './color-channel-config/GreenColorInputConfig';
import { BlueColorInputConfig } from './color-channel-config/BlueColorInputConfig';
import { Color, ColorValue } from '../../../datatypes/Color';

import './ColorInputChannels.styl';


type InputData = ColorInputConfig & { value: string }

export function ColorInputChannels(props: {
  color: Color,
  onChange: (color: Color) => void,
  alphaDisabled?: boolean,
  colorMode: 'hsl' | 'rgb',
}) {

  const ref = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [inputData, setInputData] = useState<InputData[]>(colorToInputData(props.color));
  const [colorValid, setColorValid] = useState<boolean>(true);


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
  }, [props.colorMode]);

  useEffect(() => {
    setInputData(colorToInputData(props.color));
  }, [props.color]);

  useEffect(() => {
    if (selectedIndex === null) {
      setCursorPosition(null);
    }
  }, [selectedIndex]);

  useEffect(() => {
    setInputData(colorToInputData(props.color));
  }, [props.colorMode]);

  function calculateInputLength(config?: { max?: number, base?: number }): number {
    const max = config?.max !== undefined ? config.max : 100;
    const base = config?.base !== undefined ? config.base : 10;
    return Math.ceil(Math.log(max + 1) / Math.log(base));
  }

  function prepareField(s: string, inputLength: number): string {
    const prepped = s.padStart(inputLength, '0');
    return prepped.slice(-inputLength);
  }

  function colorToInputData(c: Color): InputData[] {
    switch (props.colorMode) {
      case 'hsl':
        const hslChannels = [HueColorInputConfig, SaturationColorInputConfig, LightnessColorInputConfig];
        if (props.alphaDisabled !== true) {
          hslChannels.push(AlphaColorInputConfig);
        }
        return hslChannels.map((config, i) => {
          const hsla = c.getHsla();
          let v = (hsla as unknown as Record<string, number>)[config.name];
          const a = Math.round(config.name === 'a' ? v * 100 : v);
          return {
            ...config, value: prepareField((isFinite(a) ? a : 100).toString(config.base),
              calculateInputLength(config))
          };
        });
      case 'rgb':
      default:
        const rgbChannels = [RedColorInputConfig, GreenColorInputConfig, BlueColorInputConfig];
        if (props.alphaDisabled !== true) {
          rgbChannels.push(AlphaColorInputConfig);
        }
        return rgbChannels.map(config => {
          const v = (c.getRgba() as any)[config.name];
          const a = Math.round(config.name === 'a' ? v * 100 : v);
          return {
            ...config, value: prepareField((isFinite(a) ? a : 100).toString(config.base),
              calculateInputLength(config))
          };
        });
    }
  }

  function inputDataToColor(): Color {
    const a = inputData[3] !== undefined ? (Number.parseInt(inputData[3].value) / 100) : 1;
    const colorValue: ColorValue = props.colorMode === 'rgb' ? {
      r: Number.parseInt(inputData[0].value, 0x10),
      g: Number.parseInt(inputData[1].value, 0x10),
      b: Number.parseInt(inputData[2].value, 0x10),
      a,
    } : {
        h: Number.parseInt(inputData[0].value),
        s: Number.parseInt(inputData[1].value),
        l: Number.parseInt(inputData[2].value),
        a,
      };
    return new Color(colorValue);
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text/plain")
    setInputData(colorToInputData(new Color(pasted)));
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
      props.onChange(c);
    } else {
      setColorValid(false);
    }
  };

  const currentInputData = inputData[selectedIndex ?? 0];

  return <div className={`color-input-channels${colorValid ? '' : ' color-input-invalid'}`} ref={ref}>
    <div className="color-input-range"
      style={{
        opacity: selectedIndex !== null ? 1 : 0,
        background: `linear-gradient(90deg, 
      ${currentInputData.gradient.map((g, i, arr) => `${new Color({ ...(props.colorMode === 'hsl' ? props.color.getHsla() : props.color.getRgba()), ...g }).getRgbaString()} ${i / (arr.length - 1) * 100}% `).join(',')}`
      }} >
      <input
        type="range"
        min={currentInputData.min}
        max={currentInputData.max}
        value={Number.parseInt(currentInputData.value, currentInputData.base)}
        onChange={(event) => handleRangeInputChange(event, selectedIndex ?? 0)}
      />
    </div>
    <div className={`color-input-field${selectedIndex !== null ? ' color-input-range-active' : ''}`}>
      {inputData.map((entry: InputData, key: number) =>
        <div className="color-input-entry">
          <label>{entry.name}</label>
          <input
            key={key}
            ref={e => refs.current[key] = e}
            style={{ color: props.color.getHsla().l <= 50 ? '#FFF' : '#000' }}
            value={entry.value}
            onPaste={onPaste}
            onSelect={(event) => { setSelectedIndex(key); setCursorPosition((event.currentTarget as any).selectionStart); }}
            onKeyDown={prepareDelete}
            onKeyUp={(event) => handleDelete(event as any, key)}
            onChange={(event) => handleTextInputChange(event, key)}
            type="text"
          />
          <label>{entry.unit}</label>
        </div>
      )}
    </div>
  </div>

}