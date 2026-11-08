import React, { useEffect, useId, useRef, useSyncExternalStore } from 'react';
import { useTranslation } from '../i18n/I18n';
import { dialogService, DialogRequest } from './DialogService';
import './DialogHost.css';

function Dialog({ request }: { request: DialogRequest }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) { previousFocus.focus(); }
    };
  }, []);
  return <dialog ref={ref} className="app-dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-message`}
    onKeyDown={event => event.stopPropagation()}
    onCancel={event => { event.preventDefault(); dialogService.respond(request, false); }}>
    <h2 id={`${id}-title`}>{request.title ?? t(request.kind === 'confirm' ? 'dialog.confirm' : 'dialog.notice')}</h2>
    <p id={`${id}-message`}>{request.message}</p>
    <div className="dialog-actions">
      {request.kind === 'confirm' && <button type="button" autoFocus onClick={() => dialogService.respond(request, false)}>{t('actions.cancel')}</button>}
      <button type="button" className="dialog-primary" autoFocus={request.kind === 'alert'}
        onClick={() => dialogService.respond(request, true)}>{request.confirmLabel ?? t(request.kind === 'confirm' ? 'actions.continue' : 'actions.close')}</button>
    </div>
  </dialog>;
}

export function DialogHost() {
  const request = useSyncExternalStore(dialogService.subscribe, dialogService.current, () => null);
  // A fresh modal per request restores focus and resets the safe default action.
  return request ? <Dialog key={request.id} request={request} /> : null;
}
