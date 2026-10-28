import React, { useRef, useState, useEffect, useId } from 'react';
import type { Font } from 'opentype.js';
import { CarouselSelector } from '../../../ui/CarouselSelector';
import { AnimatedButton } from '../../../ui/AnimatedButton';
import { PlusNone, PlusRegular, PlusRotated } from '../../../ui/icon/Plus';
import { fontService } from '../../font/FontService';

import './FontValueEditor.css';

export function FontValueEditor(props: { value: Font; onChange: (font: Font) => void }) {
  const inputId = useId();
  const name = props.value?.names.fullName.en ?? '';
  const importElement = useRef<HTMLInputElement | null>(null);
  const [fonts, setFonts] = useState<string[]>([]);
  const [showUpload, setShowUpload] = useState<boolean>(false);

  useEffect(() => {
    (async () => setFonts(await fontService.listFonts()))();
  }, []);

  async function loadFont(event: React.ChangeEvent<HTMLInputElement>) {
    const file: Blob | null = (event.target.files ?? [])[0];
    if (file && importElement.current) {
      const buffer = await file.arrayBuffer();
      importElement.current.value = '';
      const saved = await fontService.saveBuffer(buffer);
      props.onChange(saved.font);
      setShowUpload(false);
      setFonts(await fontService.listFonts());
    }
  }

  return (
    <div className="font-editor polaroid">
      <label htmlFor={inputId}>font</label>
      <input id={inputId} ref={importElement} type="file" style={{ display: 'none' }} onChange={loadFont} />
      <div className="font-display polaroid-picture">
        {showUpload ? (
          <AnimatedButton
            onClick={() => importElement.current?.click()}
            title="add"
            points={[PlusNone, PlusRegular, PlusRotated]}
          />
        ) : (
          !!props.value && (
            <svg className="font-canvas">
              <path d={props.value.getPath(name, 40, 65, 80, { kerning: true }).toPathData(5)} />
              <path d={props.value.getPath(name, 5, 105, 20, { kerning: true }).toPathData(5)} />
            </svg>
          )
        )}
      </div>
      <CarouselSelector
        items={[...fonts, ''].map((f) => ({ name: f, svg: null }))}
        selected={showUpload ? '' : name}
        select={async (fontName) => {
          if (fontName === '') {
            setShowUpload(true);
          } else {
            props.onChange(await fontService.get(fontName));
            setShowUpload(false);
          }
        }}
        scale={3}
      />
    </div>
  );
}
