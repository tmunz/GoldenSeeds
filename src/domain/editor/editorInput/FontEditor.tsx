import React, { ReactNode, useState, useEffect } from 'react';

import { AnimatedButton } from '../../../ui/AnimatedButton';
import { EditorInput } from './EditorInput';
import { ParamDefinition } from '../../generator/SvgGenerator';
import { StageItemState } from '../../config/Stage';
import { fontService } from '../../font/FontService';

export class FontEditor extends EditorInput<number> {
  getEditorInput(
    name: string,
    definition: ParamDefinition,
    state: StageItemState<number>,
    action: (textValue: string) => void,
  ): ReactNode {
    return <FontSelector name={name} state={state} action={action}></FontSelector>;
  }
}

const FontSelector = (props: { name: string; state: StageItemState<number>; action: (value: string) => void }) => {
  let importConfigElement: HTMLInputElement | null = null;
  const [fonts, setFonts] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      setFonts(await fontService.listFonts());
    })();
  }, []);

  async function loadFont(event: React.ChangeEvent<HTMLInputElement>) {
    const file: Blob | null = (event.target.files ?? [])[0];
    if (file && importConfigElement) {
      if (typeof file !== 'undefined') {
        const buffer = await file.arrayBuffer();
        importConfigElement.value = '';
        const font = await fontService.saveBuffer(buffer);
        props.action(font.fontName);
        setFonts(await fontService.listFonts());
      }
    }
  }

  return (
    <div>
      <div>{name}</div>
      <div>{props.state.textValue}</div>
      <div>
        {fonts.map((fontName) => (
          <div key={fontName}>
            <a onClick={() => props.action(fontName)}>{fontName}</a>
          </div>
        ))}
      </div>
      <input
        ref={(e) => (importConfigElement = e)}
        type="file"
        style={{ display: 'none' }}
        onChange={(event) => loadFont(event)}
      />
      <a target="_blank" onClick={() => importConfigElement?.click()}>
        <AnimatedButton rotation={AnimatedButton.DIRECTION_UP} title="load" iconText="font" />
      </a>
    </div>
  );
};
