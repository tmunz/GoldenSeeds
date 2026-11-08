import React from 'react';
import deleteIcon from './delete.svg';

export function DeleteIcon() {
  const mask = `url("${deleteIcon}") center / contain no-repeat`;
  return <span className="delete-icon" aria-hidden="true" style={{
    display: 'inline-block', width: 18, height: 18, flexShrink: 0,
    backgroundColor: 'currentColor', mask, WebkitMask: mask,
  }} />;
}
