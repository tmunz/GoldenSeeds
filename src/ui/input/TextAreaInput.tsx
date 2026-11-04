import React, { useId } from 'react';

import './Input.css';
import './TextAreaInput.css';

export function TextAreaInput({ label, value, onChange, className, description, placeholder }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  description?: string;
  placeholder?: string;
}) {
  const id = useId();
  return <div className="input textarea-input" title={description}>
    <label htmlFor={id}>{label}</label>
    <textarea id={id} value={value} className={className} placeholder={placeholder}
      rows={4} spellCheck={false} aria-describedby={description ? `${id}-description` : undefined}
      aria-invalid={className?.includes('invalid') || undefined}
      onChange={event => onChange(event.target.value)} />
    {description && <span id={`${id}-description`} hidden>{description}</span>}
  </div>;
}
