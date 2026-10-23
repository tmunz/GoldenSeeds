import React, { useEffect, useState } from 'react';
import { ExtendedRangeInput } from '../../ui/input/ExtendedRangeInput';
import { ParamDefinitionMinMaxStep } from '../generator/SvgGenerator';

export function ExpressionParameterEditor({ label, value, definition, onChange }: {
  label: string;
  value: string;
  definition: Partial<ParamDefinitionMinMaxStep>;
  onChange: (text: string) => boolean;
}) {
  const [text, setText] = useState(value);
  const [valid, setValid] = useState(true);
  useEffect(() => {
    setText(value);
    setValid(true);
  }, [value]);
  return (
    <div className="expression-parameter-editor nodrag nowheel">
      <ExtendedRangeInput
        label={label}
        value={text}
        min={definition.min}
        max={definition.max}
        step={definition.step}
        className={valid ? '' : 'invalid range-invalid'}
        onChange={(next) => {
          setText(next);
          setValid(onChange(next));
        }}
      />
    </div>
  );
}
