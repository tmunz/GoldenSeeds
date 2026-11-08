import React from 'react';
import helpIcon from './help.svg';

export function HelpIcon() {
  return <span aria-hidden="true" style={{ display: 'inline-block', width: 18, height: 18, background: 'currentColor',
    mask: `url(${helpIcon}) center / contain no-repeat`, WebkitMask: `url(${helpIcon}) center / contain no-repeat` }} />;
}
