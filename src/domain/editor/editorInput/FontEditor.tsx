import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { Font } from 'opentype.js';

import { EditorInput } from './EditorInput';
import { ParamDefinition } from '../../generator/SvgGenerator';
import { FontState } from '../../config/stageItemState/FontState';
import { fontService } from '../../font/FontService';
import { CarouselSelector } from '../../../ui/CarouselSelector';
import { AnimatedButton } from '../../../ui/AnimatedButton';
import { PlusNone, PlusRegular, PlusRotated } from '../../../ui/icon/Plus';

import './FontEditor.styl';


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

const FontSelector = (props: { name: string; state: FontState; action: (value: Font) => void }) => {
  const importElement = useRef<HTMLInputElement | null>(null);
  const [fonts, setFonts] = useState<string[]>([]);
  const [showUpload, setShowUpload] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setFonts(await fontService.listFonts());
    })();
  }, []);

  async function loadFont(event: React.ChangeEvent<HTMLInputElement>) {
    const file: Blob | null = (event.target.files ?? [])[0];
    if (file && importElement) {
      if (typeof file !== 'undefined' && importElement.current) {
        const buffer = await file.arrayBuffer();
        importElement.current.value = '';
        props.action((await fontService.saveBuffer(buffer)).font);
        setFonts(await fontService.listFonts());
      }
    }
  }

  return <div className="font-editor polaroid">
    <label>{props.name}</label>
    <div className="font-display polaroid-picture">
      {showUpload ? <>
        <input
          ref={importElement}
          type="file"
          style={{ display: 'none' }}
          onChange={(event) => loadFont(event)}
        />
        <AnimatedButton
          onClick={() => importElement.current?.click()}
          title="add"
          points={[PlusNone, PlusRegular, PlusRotated]}
        />
      </> :
        <>
          {<svg className="font-canvas">
            <path
              d={props.state.getValue().getPath(props.state.getTextValue(), 40, 65, 80, { kerning: true }).toPathData(5)}
            />
            <path
              d={props.state.getValue().getPath(props.state.getTextValue(), 5, 105, 20, { kerning: true }).toPathData(5)}
            />
          </svg>}
        </>
      }
    </div>
    <CarouselSelector
      items={[...fonts, ''].map(f => ({ name: f, svg: null }))}
      selected={showUpload ? '' : props.state.getTextValue()}
      select={async (fontName) => {
        if (fontName === '') {
          setShowUpload(true);
        } else {
          const font = await fontService.get(fontName);
          props.action(font);
          setShowUpload(false);
        }
      }}
      scale={3}
    />
  </div>;
};
