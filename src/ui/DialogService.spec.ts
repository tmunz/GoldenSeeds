import { alertDialog, confirmDialog, dialogService } from './DialogService';

afterEach(() => {
  let request = dialogService.current();
  while (request) { dialogService.respond(request, false); request = dialogService.current(); }
});

test('confirmation waits for a response and cancellation leaves the action unapproved', async () => {
  const listener = jest.fn();
  const unsubscribe = dialogService.subscribe(listener);
  const action = jest.fn();
  const result = confirmDialog('Discard edits?').then(accepted => { if (accepted) { action(); } return accepted; });
  const request = dialogService.current()!;
  expect(request.message).toBe('Discard edits?');
  expect(action).not.toHaveBeenCalled();
  dialogService.respond(request, false);
  expect(await result).toBe(false);
  expect(action).not.toHaveBeenCalled();
  expect(dialogService.current()).toBeNull();
  expect(listener).toHaveBeenCalledTimes(2);
  unsubscribe();
});

test('queued prompts resolve separately and repeated responses cannot approve the next one', async () => {
  const first = confirmDialog('Untrusted formula?');
  const second = confirmDialog('Discard edits?');
  const request = dialogService.current()!;
  dialogService.respond(request, true);
  expect(await first).toBe(true);
  const next = dialogService.current()!;
  expect(next.message).toBe('Discard edits?');
  dialogService.respond(request, true);
  expect(dialogService.current()).toBe(next);
  dialogService.respond(next, false);
  expect(await second).toBe(false);
});

test('error notices use the same queue with a single acknowledgement', async () => {
  const result = alertDialog('Invalid JSON', { title: 'Import failed' });
  const request = dialogService.current()!;
  expect(request.kind).toBe('alert');
  expect(request.title).toBe('Import failed');
  dialogService.respond(request, true);
  expect(await result).toBe(true);
});
