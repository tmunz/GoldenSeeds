import React, { useId } from 'react';
import { AnimatedButton } from './AnimatedButton';

import './Frame.css';

export function Frame(props: {
  className?: string;
  title: string;
  label: string;
  open: boolean;
  onToggle: () => void;
  iconPaths: number[][][];
  children: React.ReactNode;
}) {
  const panelId = useId();

  return (
    <section className={`frame-column ${props.className ?? ''}${props.open ? ' open' : ''}`} aria-label={props.label}>
      <div
        id={panelId}
        className="frame-content"
        aria-hidden={!props.open}
        {...(!props.open ? { inert: '' } : {})}
      >
        {props.children}
      </div>
      <footer className="frame-footer">
        <AnimatedButton
          className="frame-toggle"
          title={props.title}
          points={props.iconPaths}
          active={props.open}
          expanded={props.open}
          controls={panelId}
          onClick={props.onToggle}
        />
      </footer>
    </section>
  );
}
