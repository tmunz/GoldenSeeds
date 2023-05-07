import React, { useState, useRef, useEffect, ChangeEvent } from 'react';

import './Input.styl';
import './TextInput.styl';

export interface Props {
  label?: string;
  value?: any;
  onChange: (value: string) => void;
  className?: string;
}

export const TextInput = (props: Props) => {
  const [cursor, setCursor] = useState<number | null>(0);
  const ref = useRef(null);

  useEffect(() => {
    const input: any = ref.current;
    if (input) {
      input.setSelectionRange(cursor, cursor);
    }
  }, [ref, cursor, props.value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCursor(e.target.selectionStart);
    props.onChange(e.target.value);
  };

  return (
    <div className="input text-input">
      <input
        ref={ref}
        className={props.className}
        type="text"
        onChange={(e) => handleChange(e)}
        value={typeof props.value !== 'undefined' ? props.value : ''}
      />
      <label className={props.value === '' || typeof props.value === 'undefined' ? 'input-empty' : ''}>{props.label}</label>
      <div className="indicator" />
    </div>
  );
};
