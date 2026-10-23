import React, { useEffect, useState } from 'react';
import { ExtendedRangeInput } from '../../ui/input/ExtendedRangeInput';
import { ParamDefinitionMinMaxStep } from '../generator/SvgGenerator';

export function NumberParameterEditor({ label, value, definition, onChange }: {
  label: string;
  value: string;
  definition: Partial<ParamDefinitionMinMaxStep>;
  onChange: (text: string) => void;
}) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  const valid = text.trim() !== '' && Number.isFinite(Number(text));
  return (
    <div className="number-parameter-editor nodrag nowheel">
      <ExtendedRangeInput
        label={label}
        value={text}
        min={definition.min}
        max={definition.max}
        step={definition.step}
        className={valid ? '' : 'invalid range-invalid'}
        onChange={(next) => {
          setText(next);
          if (next.trim() !== '' && Number.isFinite(Number(next))) {
            onChange(next);
          }
        }}
      />
    </div>
  );
}
