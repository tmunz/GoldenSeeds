import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '../i18n/I18n';
import { HelpIcon } from './icon/Help';
import './HelpPopover.css';

const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function HelpPopover({ label, children }: { label: string; children: React.ReactNode }) {
  const { t } = useTranslation();
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const clearTimer = () => clearTimeout(timer.current);
  const close = () => { clearTimer(); setOpen(false); setPinned(false); };
  const leave = () => { clearTimer(); if (!pinned) { timer.current = setTimeout(() => setOpen(false), 150); } };

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) { return; }
    const outside = (event: PointerEvent) => {
      if (!trigger.current?.contains(event.target as Node) && !panel.current?.contains(event.target as Node)) { close(); }
    };
    const focusOutside = (event: FocusEvent) => {
      if (!trigger.current?.contains(event.target as Node) && !panel.current?.contains(event.target as Node)) { close(); }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); trigger.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', focusOutside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', focusOutside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  useClientLayoutEffect(() => {
    if (!open) { return; }
    const place = () => {
      const anchor = trigger.current?.getBoundingClientRect();
      const box = panel.current?.getBoundingClientRect();
      if (!anchor || !box) { return; }
      const top = anchor.bottom + 8 + box.height <= window.innerHeight - 12
        ? anchor.bottom + 8 : Math.max(12, anchor.top - box.height - 8);
      setPosition({ left: Math.max(12, Math.min(anchor.right - box.width, window.innerWidth - box.width - 12)), top });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [open]);

  return <span className="input-help nodrag nopan nowheel" onPointerEnter={() => { clearTimer(); setOpen(true); }} onPointerLeave={leave}>
    <button ref={trigger} type="button" className="input-help-trigger" aria-label={label} aria-expanded={open}
      aria-controls={open ? id : undefined} aria-haspopup="dialog"
      onClick={() => { clearTimer(); if (pinned) { close(); } else { setPinned(true); setOpen(true); } }}>
      <HelpIcon />
    </button>
    {open && createPortal(<div ref={panel} id={id} role="dialog" aria-label={label}
      className="help-popover nodrag nopan nowheel" style={position} onPointerEnter={clearTimer} onPointerLeave={leave}>
      <div className="help-popover-heading"><h2>{label}</h2>
        <button type="button" aria-label={t('actions.close')} onClick={() => { close(); trigger.current?.focus(); }}>×</button></div>
      {children}
    </div>, document.body)}
  </span>;
}
