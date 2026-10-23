import React, { useEffect, useMemo, useState } from 'react';
import { NumberAnimationControls } from '../animation/NumberAnimationControls';
import { Color } from '../../datatypes/Color';
import { ColorInput } from '../../ui/input/color/ColorInput';
import { ExtendedRangeInput } from '../../ui/input/ExtendedRangeInput';
import { TextInput } from '../../ui/input/TextInput';
import { ParamDefinition } from '../generator/SvgGenerator';

/** Draft text stays local until the owner accepts an immutable update. */
export function ParameterEditor({ label, value, definition, onChange, portId, showAnimation = false }: {
  portId?: string;
  showAnimation?: boolean;
  label: string;
  value: string;
  definition: ParamDefinition;
  onChange: (text: string) => boolean;
}) {
  const [text, setText] = useState(value);
  const [valid, setValid] = useState(true);
  useEffect(() => { setText(value); setValid(true); }, [value]);
  const color = useMemo(() => definition.type === 'color' ? new Color(value) : null, [definition.type, value]);
  function change(next: string) {
    setText(next);
    setValid(onChange(next));
  }
  let editor: React.ReactNode;
  switch (definition.type) {
  case 'number':
  case 'expression':
    editor = <ExtendedRangeInput label={label} value={text} min={definition.min} max={definition.max} step={definition.step}
      className={valid ? '' : 'invalid range-invalid'} onChange={change} />;
    break;
  case 'selection':
    editor = <label className="parameter-option-editor"><span>{label}</span>
      <select value={text} onChange={(event) => change(event.target.value)}>
        {definition.options.map((option, index) => <option key={option} value={index}>{index}: {option}</option>)}
      </select>
    </label>;
    break;
  case 'string':
    editor = <TextInput label={label} value={text} onChange={change} />;
    break;
  case 'color':
    editor = <ColorInput label={label} value={color} onChange={(next) => change(next.getAcn())} />;
    break;
  default: return null;
  }
  return <div className="parameter-editor nodrag nowheel">
    {editor}
    {showAnimation && definition.type === 'number' && <NumberAnimationControls value={value} definition={definition} portId={portId} valid={valid} />}
  </div>;
}
