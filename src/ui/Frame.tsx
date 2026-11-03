import React, { useId } from 'react';
import { useTranslation } from '../i18n/I18n';
import { AnimatedButton } from './AnimatedButton';

import './Frame.css';

export function Frame(props: {
  className?: string;
  title: string;
  step: string;
  label: string;
  open: boolean;
  onToggle: () => void;
  iconPaths: number[][][];
  headerContent?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const panelId = useId();
  const heading = <div className="frame-heading"><span>{props.step}</span><h2>{props.title.toLowerCase()}</h2></div>;

  return (
    <section className={`frame-column ${props.className ?? ''}${props.open ? ' open' : ''}`} aria-label={props.label}>
      <div
        id={panelId}
        className="frame-content"
        aria-hidden={!props.open}
        {...(!props.open ? { inert: '' } : {})}
      >
        {props.headerContent ? <div className="frame-header">{heading}{props.headerContent}</div> : heading}
        {props.children}
      </div>
      <footer className="frame-footer">
        <AnimatedButton
          className="frame-toggle"
          title={props.open ? t('actions.close') : props.title}
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
