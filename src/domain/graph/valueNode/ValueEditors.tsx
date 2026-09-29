import React, { useRef, useState, useEffect } from 'react';

import { ColorState } from '../../config/stageItemState/ColorState';
import { NumberState } from '../../config/stageItemState/NumberState';
import { ExpressionState } from '../../config/stageItemState/ExpressionState';
import { StringState } from '../../config/stageItemState/StringState';
import { FontState } from '../../config/stageItemState/FontState';
import { ParamDefinitionMinMaxStep, ParamDefinitionSelection } from '../../generator/SvgGenerator';
import { ColorInput } from '../../../ui/input/color/ColorInput';
import { ExtendedRangeInput } from '../../../ui/input/ExtendedRangeInput';
import { TextInput } from '../../../ui/input/TextInput';
import { RangeInput } from '../../../ui/input/RangeInput';
import { CarouselSelector } from '../../../ui/CarouselSelector';
import { AnimatedButton } from '../../../ui/AnimatedButton';
import { PlusNone, PlusRegular, PlusRotated } from '../../../ui/icon/Plus';
import { fontService } from '../../font/FontService';

import './FontValueEditor.styl';

/**
 * The visual content shown on each kind of value node (see ValueNodeRegistry/ValueNodeView) - the
 * same input components the old per-stage parameter editors (ColorEditor, NumberEditor, ...) used
 * before generator parameters were split into separately-connectable value nodes, now rendered
 * directly on the node itself. Every editor mutates its node's StageItemState in place and then
 * calls `onCommit` so the containing GraphCanvas can re-evaluate the graph and persist the change.
 */

export function ColorValueEditor(props: { state: ColorState; onCommit: () => void }) {
  return (
    <ColorInput
      label="color"
      value={props.state.getValue()}
      onChange={(color) => { props.state.setValue(color); props.onCommit(); }}
    />
  );
}

export function NumberValueEditor(props: { state: NumberState; definition?: ParamDefinitionMinMaxStep; onCommit: () => void }) {
  return (
    <ExtendedRangeInput
      label="number"
      value={props.state.getTextValue()}
      onChange={async (s) => { await props.state.setTextValue(s); props.onCommit(); }}
      className={props.state.isValid() ? '' : 'invalid range-invalid'}
      min={props.definition?.min}
      max={props.definition?.max}
      step={props.definition?.step}
    />
  );
}

export function ExpressionValueEditor(props: { state: ExpressionState; definition?: ParamDefinitionMinMaxStep; onCommit: () => void }) {
  return (
    <ExtendedRangeInput
      label="expression"
      value={props.state.getTextValue()}
      onChange={async (s) => { await props.state.setTextValue(s); props.onCommit(); }}
      className={props.state.isValid() ? '' : 'invalid range-invalid'}
      min={props.definition?.min}
      max={props.definition?.max}
      step={props.definition?.step}
    />
  );
}

export function StringValueEditor(props: { state: StringState; onCommit: () => void }) {
  return (
    <TextInput
      label="string"
      value={props.state.getValue()}
      onChange={async (s) => { await props.state.setTextValue(s); props.onCommit(); }}
    />
  );
}

export function SelectionValueEditor(props: { state: StringState; definition?: ParamDefinitionSelection; onCommit: () => void }) {
  const options = props.definition?.options ?? [];
  return (
    <RangeInput<string>
      label="selection"
      value={options.indexOf(props.state.getValue() ?? '')}
      output={props.state.getTextValue() ?? ''}
      onChange={async (s) => { await props.state.setTextValue(s); props.onCommit(); }}
      min={0}
      max={options.length ? options.length - 1 : 0}
      step={1}
      options={options}
    />
  );
}

export function FontValueEditor(props: { state: FontState; onCommit: () => void }) {
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
      props.state.setValue(saved.font);
      props.onCommit();
      setFonts(await fontService.listFonts());
    }
  }

  return (
    <div className="font-editor polaroid">
      <label>font</label>
      <div className="font-display polaroid-picture">
        {showUpload ? (
          <>
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
          </>
        ) : (
          props.state.isValid() && (
            <svg className="font-canvas">
              <path d={props.state.getValue().getPath(props.state.getTextValue(), 40, 65, 80, { kerning: true }).toPathData(5)} />
              <path d={props.state.getValue().getPath(props.state.getTextValue(), 5, 105, 20, { kerning: true }).toPathData(5)} />
            </svg>
          )
        )}
      </div>
      <CarouselSelector
        items={[...fonts, ''].map((f) => ({ name: f, svg: null }))}
        selected={showUpload ? '' : props.state.getTextValue()}
        select={async (fontName) => {
          if (fontName === '') {
            setShowUpload(true);
          } else {
            await props.state.setTextValue(fontName);
            props.onCommit();
            setShowUpload(false);
          }
        }}
        scale={3}
      />
    </div>
  );
}
