import React, { useState, useRef, useEffect, useId, ChangeEvent, MutableRefObject } from 'react';
import { HelpPopover } from '../HelpPopover';

import './Input.css';
import './TextInput.css';

export interface Props {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  readOnly?: boolean;
  description?: string;
  help?: React.ReactNode;
  helpLabel?: string;
}

export const TextInput = (props: Props) => {
  const id = useId();
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
    <div className={`input text-input${props.help ? ' has-help' : ''}`} title={props.description}>
      <input
        id={id}
        ref={ref}
        className={props.className}
        type="text"
        readOnly={props.readOnly}
        aria-describedby={props.description ? `${id}-description` : undefined}
        onChange={(e) => handleChange(e)}
        value={typeof props.value !== 'undefined' ? props.value : ''}
      />
      <label htmlFor={id} className={props.value === '' || typeof props.value === 'undefined' ? 'input-empty' : ''}>{props.label}</label>
      <div className="indicator" />
      {props.help && <HelpPopover label={props.helpLabel ?? props.label ?? ''}>{props.help}</HelpPopover>}
      {props.description && <span id={`${id}-description`} hidden>{props.description}</span>}
    </div>
  );
};
