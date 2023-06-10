import React, { useState, useEffect } from 'react';

import { AnimatedIcon } from './AnimatedIcon';
import { ArrowFlat, ArrowRegular, ArrowNone } from './icon/Arrow';

import './AnimatedButton.styl';


export const DIRECTION_UP = 180;
export const DIRECTION_DOWN = 0;
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
}) {

  const [active, setActive] = useState(props.active ?? false);

  useEffect(() => {
    if (props.active === undefined) {
      if (active === true) {
        setTimeout(() => setActive(false), 500);
      }
    } else {
      setActive(props.active);
    }
  }, [props.active, active]);

  function handleClick(): void {
    setActive(props.active === undefined ? !active : true);
    props.onClick?.(active);
  }

  return (
    <button
      className={['animated-button', props.className ?? '', active ? 'active' : ''].join(' ')}
      onClick={() => handleClick()}
    >
      <div className="tooltip">{props.title}</div>
      <div className="icon-text">{props.iconText}</div>
      <AnimatedIcon
        points={props.points ?? [ArrowNone, ArrowFlat, ArrowRegular]}
        index={props.disabled ? 0 : (active ? 2 : 1)}
        rotation={props.rotation ?? 0}
      />
    </button>
  );
}
