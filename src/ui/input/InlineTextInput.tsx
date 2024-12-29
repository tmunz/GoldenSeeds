import React, { useState, useRef, useEffect, ChangeEvent, MutableRefObject } from 'react';

import './Input.styl';
import './InlineTextInput.styl';

export interface Props {
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}

export const InlineTextInput = (props: Props) => {
  const [cursor, setCursor] = useState<number | null>(0);
  const ref: MutableRefObject<HTMLInputElement | null> = useRef(null);

  useEffect(() => {
    const input = ref.current;
    if (input && cursor !== null) {
      input.setSelectionRange(cursor, cursor);
    }
  }, [ref, cursor, props.value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCursor(e.target.selectionStart);
    props.onChange(e.target.value);
  };

  return (
    <div className="input inline-text-input">
      <input
        ref={ref}
        className={props.className}
        placeholder={props.placeholder}
        type="text"
        onChange={(e) => handleChange(e)}
        value={typeof props.value !== 'undefined' ? props.value : ''}
      />
    </div>
  );
};
