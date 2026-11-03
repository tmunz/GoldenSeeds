import React, { useState, useEffect } from 'react';

import { AnimatedIcon } from './AnimatedIcon';
import { ArrowFlat, ArrowRegular, ArrowNone } from './icon/Arrow';

import './AnimatedButton.css';


export const DIRECTION_LEFT = 90;
export const DIRECTION_RIGHT = 270;

export function AnimatedButton(props: {
  title?: string;
  iconText?: string;
  rotation?: number;
  disabled?: boolean;
  onClick?: (active?: boolean) => void;
  points?: number[][][];
  className?: string;
  active?: boolean;
  expanded?: boolean;
  controls?: string;
}) {

  const [active, setActive] = useState(props.active ?? false);

  useEffect(() => {
    if (props.active === undefined) {
      if (active === true) {
        const timeout = setTimeout(() => setActive(false), 200);
        return () => clearTimeout(timeout);
      }
    } else {
      setActive(props.active);
    }
  }, [props.active, active]);

  function handleClick(): void {
    if (props.disabled) { return; }
    setActive(props.active === undefined ? !active : true);
    props.onClick?.(active);
  }

  return (
    <button
      className={['animated-button', props.className ?? '', active ? 'active' : ''].join(' ')}
      onClick={() => handleClick()}
      disabled={props.disabled}
      type="button"
      aria-label={[props.title, props.iconText].filter(Boolean).join(' ')}
      aria-expanded={props.expanded}
      aria-controls={props.controls}
    >
      {props.iconText && <div className="icon-text" aria-hidden="true">{props.iconText}</div>}
      <span className="button-icon">
        <span className="tooltip" aria-hidden="true">{props.title}</span>
        <AnimatedIcon
          points={props.points ?? [ArrowNone, ArrowFlat, ArrowRegular]}
          index={props.disabled ? 0 : (active ? 2 : 1)}
          rotation={props.rotation ?? 0}
        />
      </span>
    </button>
  );
}
