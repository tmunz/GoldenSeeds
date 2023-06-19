import React, { ReactNode, useState, useEffect } from 'react';

import { AnimatedButton, DIRECTION_UP } from '../../../ui/AnimatedButton';
import { EditorInput } from './EditorInput';
import { ParamDefinition } from '../../generator/SvgGenerator';
import { StageItemState } from '../../config/stageItemState/StageItemState';
import { fontService } from '../../font/FontService';
import { Font } from 'opentype.js';
import { FontState } from '../../config/stageItemState/FontState';

export class FontEditor extends EditorInput<Font, Font> {
  getEditorInput(
    name: string,
    definition: ParamDefinition,
    state: FontState,
    action: (value: Font) => void,
  ): ReactNode {
    return <FontSelector name={name} state={state} action={action}></FontSelector>;
  }
}

const FontSelector = (props: { name: string; state: StageItemState<Font, Font>; action: (value: Font) => void }) => {
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
        props.action((await fontService.saveBuffer(buffer)).font);
        setFonts(await fontService.listFonts());
      }
    }
  }

  return (
    <div>
      <div>{props.name}</div>
      <div>{props.state.getTextValue() ?? 'unknown'}</div>
      <div>
        {fonts.map((fontName) => (
          <div key={fontName}>
            <button onClick={async () =>
              props.action(await fontService.get(fontName))
            }>{fontName}</button>
          </div>
        ))}
      </div>
      <input
        ref={(e) => (importConfigElement = e)}
        type="file"
        style={{ display: 'none' }}
        onChange={(event) => loadFont(event)}
      />
      <AnimatedButton
        rotation={DIRECTION_UP}
        title="load"
        iconText="font"
        onClick={() => importConfigElement?.click()}
      />
    </div>
  );
};
