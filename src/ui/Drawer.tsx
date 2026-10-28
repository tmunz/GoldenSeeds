import React, { useId } from 'react';
import { AnimatedButton } from './AnimatedButton';

import './Drawer.css';

export function Drawer(props: {
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
    <section className={`drawer-column ${props.className ?? ''}${props.open ? ' open' : ''}`} aria-label={props.label}>
      <header className="drawer-header">
        <AnimatedButton
          className="drawer-toggle"
          title={props.title}
          points={props.iconPaths}
          active={props.open}
          expanded={props.open}
          controls={panelId}
          onClick={props.onToggle}
        />
      </header>
      <div
        id={panelId}
        className="drawer-content"
        aria-hidden={!props.open}
        {...(!props.open ? { inert: '' } : {})}
      >
        {props.children}
      </div>
    </section>
  );
}
