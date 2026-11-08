export interface DialogOptions {
  title?: string;
  confirmLabel?: string;
}

export interface DialogRequest extends DialogOptions {
  id: number;
  message: string;
  kind: 'confirm' | 'alert';
  resolve: (accepted: boolean) => void;
}

const queue: DialogRequest[] = [];
let nextId = 0;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(listener => listener());

export const dialogService = {
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  current: () => queue[0] ?? null,
  respond(request: DialogRequest, accepted: boolean) {
    if (queue[0] !== request) { return; }
    queue.shift();
    request.resolve(accepted);
    notify();
  },
};

function requestDialog(kind: DialogRequest['kind'], message: string, options: DialogOptions): Promise<boolean> {
  return new Promise(resolve => {
    queue.push({ ...options, id: ++nextId, kind, message, resolve });
    notify();
  });
}

export const confirmDialog = (message: string, options: DialogOptions = {}) => requestDialog('confirm', message, options);
export const alertDialog = (message: string, options: DialogOptions = {}) => requestDialog('alert', message, options);
