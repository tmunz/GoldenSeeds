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
  const [colorMode, setColorMode] = useState<ColorMode>('rgb');


  const prepareField = (s: string, inputLength: number): string => {
    const prepped = s.padStart(inputLength, '0');
    return prepped.slice(-inputLength);
  };

  const calculateInputLength = (config?: { max?: number, base?: number }): number => {
    const max = config?.max !== undefined ? config.max : 100;
    const base = config?.base !== undefined ? config.base : 10;
    return Math.ceil(Math.log(max + 1) / Math.log(base));
  }

  const colorToInputData = (c: Color): InputData[] => {
    switch (colorMode) {
      case 'random': return ['', '', ''].map((key, i) => ({
        name: key,
        value: i === 0 ? 'ra' : i === 1 ? 'nd' : i === 2 ? 'om' : '',
        gradient: [{ r: 0xff, g: 0, b: 0 }, { r: 0, g: 0xff, b: 0 }, { r: 0, g: 0, b: 0xff }],
      }));
      case 'hsl': return [HueColorInputConfig, SaturationColorInputConfig, LightnessColorInputConfig, AlphaColorInputConfig].map(config => {
        const v = (c.getHsla() as any)[config.name];
        return {
          ...config, value: prepareField(Math.round(config.name === 'a' ? v * 100 : v).toString(config.base),
            calculateInputLength(config))
        };
      });
      case 'rgb':
      default: return [RedColorInputConfig, GreenColorInputConfig, BlueColorInputConfig, AlphaColorInputConfig].map(config => {
        const v = (c.getRgba() as any)[config.name];
        return {
          ...config, value: prepareField(Math.round(config.name === 'a' ? v * 100 : v).toString(config.base),
            calculateInputLength(config))
        };
      });
    }
  }

  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [cursor, setCursor] = useState<number[] | null>(null);
  const [color, setColor] = useState<Color>(new Color('#000000'));
  const [colorValid, setColorValid] = useState<boolean>(true);
  const [inputData, setInputData] = useState<InputData[]>(colorToInputData(color));

  useEffect(() => {
    const c = new Color(props.value);
    if (inputDataToColor().getAcn() !== c.getAcn()) {
      setInputData(colorToInputData(c));
      setColor(c);
    }
  }, [props.value, colorMode]);

  useEffect(() => {
    if (cursor !== null) {
      const inputIndex = cursor[0] ?? 0;
      const input = refs.current[inputIndex];
      if (input) {
        input.focus();
        input.setSelectionRange(cursor[1], cursor[1] /*+1*/);
      }
    }
  }, [refs, cursor, inputData]);

  const inputDataToColor = () => {
    const colorValue: ColorValue = colorMode === 'rgb' ? {
      r: Number.parseInt(inputData[0].value, 0x10),
      g: Number.parseInt(inputData[1].value, 0x10),
      b: Number.parseInt(inputData[2].value, 0x10),
    } : colorMode === 'hsl' ? {
      h: Number.parseInt(inputData[0].value),
      s: Number.parseInt(inputData[1].value),
      l: Number.parseInt(inputData[2].value),
    } : colorMode;
    return new Color(colorValue);
  }

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text/plain")
    setInputData(colorToInputData(new Color(pasted)));
  };

  const prepareDelete = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const code = event.keyCode || event.charCode;
    if (code === 8 || code === 46) {
      event.preventDefault();
    }
  }

  const handleDelete = (event: React.KeyboardEvent<HTMLInputElement> & ChangeEvent<HTMLInputElement>, key: number) => {
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

  const handleRangeInputChange = (event: ChangeEvent<HTMLInputElement>, key: number) => {
    const n = Number.parseInt(event.target.value);
    update(n.toString(inputData[key].base ?? 10), key, 0);
  }

  const handleTextInputChange = (event: ChangeEvent<HTMLInputElement>, key: number) => {
    const s = event.target.value ?? '';
    const index = event.target.selectionStart ?? 0;
    update(`${s.slice(0, index)}${s.slice(index + 1)}`, key, index);
  }

  const adjustCursorPosition = (inputLength: number, cursorPosition: number, key: number) => {
    if (inputLength !== undefined && inputLength <= cursorPosition) {
      const nextInputField = refs.current[key + 1];
      if (nextInputField !== undefined && nextInputField !== null) {
        setCursor([key + 1, 0]);
      } else {
        setCursor([key, cursorPosition]);
      }
    } else {
      const nextInputField = refs.current[key];
      if (nextInputField !== undefined && nextInputField !== null) {
        setCursor([key, cursorPosition]);
      }
    };
  }

  const update = (s: string, key: number, cursorPosition: number) => {
    const nextString = prepareField(s, calculateInputLength(inputData[key]));
    const nextInputDatas: InputData[] = [...inputData];
    nextInputDatas[key].value = nextString;
    setInputData(nextInputDatas);
    const currentInputData = cursor ? nextInputDatas[cursor[0]] : undefined;
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

  const currentInputData = inputData[(cursor && cursor[0]) ?? 0];

  return <div className="color-input">
    <div className={`color-input-main${colorValid ? '' : ' color-input-invalid'}`}>
      <div className="color-input-range"
        style={{
          opacity: cursor ? 1 : 0,
          background: `linear-gradient(90deg, 
            ${currentInputData.gradient.map((g, i, arr) => `${new Color(g).getRgbaString()} ${i / (arr.length - 1) * 100}% `).join(',')}`
        }} >
        <input
          type="range"
          min={currentInputData.min}
          max={currentInputData.max}
          value={Number.parseInt(currentInputData.value, currentInputData.base)}
          onChange={(event) => handleRangeInputChange(event, cursor ? cursor[0] : 0)}
        />
      </div>
      <div className="color-input-field"
        style={{ background: `linear-gradient(90deg, ${cursor ? 'transparent' : color.getRgbaString()}  0%, ${color.getRgbaString()} 40%` }}>
        {inputData.map((entry: InputData, key: number) =>
          <div className="color-input-entry">
            <label>{entry.name}</label>
            <input
              key={key}
              ref={e => refs.current[key] = e}
              style={{ color: color.getHsla().l < 50 ? '#FFF' : '#000' }}
              value={entry.value}
              onPaste={onPaste}
              onSelect={(event) => setCursor([key, (event.currentTarget as any).selectionStart])}
              onKeyDown={prepareDelete}
              onKeyUp={(event) => handleDelete(event as any, key)}
              onChange={(event) => handleTextInputChange(event, key)}
              disabled={colorMode === 'random'}
            />
            <label>{entry.unit}</label>
          </div>
        )}
      </div>
    </div>
    <CarouselSelector
      items={COLOR_MODES.map(c => ({ name: c.toString(), svg: null }))}
      selected={colorMode}
      select={(c) => {
        setColorMode(c as ColorMode);
      }}
    />
  </div>
}