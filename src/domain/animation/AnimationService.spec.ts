import { AnimationScheduler, AnimationService } from './AnimationService';

function scheduler() {
  let time = 0;
  let nextId = 0;
  const frames = new Map<number, (time: number) => void>();
  const clock: AnimationScheduler = {
    now: () => time,
    request: (callback) => { frames.set(++nextId, callback); return nextId; },
    cancel: (id) => { frames.delete(id); },
  };
  return {
    clock,
    tick: (next: number) => {
      time = next;
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach((callback) => callback(time));
    },
    pending: () => frames.size,
  };
}

describe('number playback', () => {
  test('starts at zero, interpolates linearly over seconds, and completes exactly at the target', () => {
    const test = scheduler();
    const service = new AnimationService(test.clock);
    const update = jest.fn();
    const complete = jest.fn();
    service.animateNumber(10, 2, update, complete);
    expect(update).toHaveBeenLastCalledWith(0);
    expect(service.isAnimating).toBe(true);
    test.tick(500);
    expect(update).toHaveBeenLastCalledWith(2.5);
    test.tick(1000);
    expect(update).toHaveBeenLastCalledWith(5);
    test.tick(2500);
    expect(update).toHaveBeenLastCalledWith(10);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(service.isAnimating).toBe(false);
    expect(test.pending()).toBe(0);
  });

  test.each([0, -10, 0.25])('reaches target %s using elapsed time', (target) => {
    const test = scheduler();
    const service = new AnimationService(test.clock);
    const update = jest.fn();
    service.animateNumber(target, 1, update);
    test.tick(500);
    expect(update).toHaveBeenLastCalledWith(target / 2);
    test.tick(1000);
    expect(update).toHaveBeenLastCalledWith(target);
    expect(service.isAnimating).toBe(false);
  });

  test('cancels independently and allows restarting', () => {
    const test = scheduler();
    const service = new AnimationService(test.clock);
    const first = jest.fn();
    const other = jest.fn();
    const complete = jest.fn();
    const cancel = service.animateNumber(10, 2, first, complete);
    service.animateNumber(20, 2, other);
    test.tick(1000);
    cancel();
    test.tick(2000);
    expect(first).toHaveBeenLastCalledWith(5);
    expect(other).toHaveBeenLastCalledWith(20);
    expect(complete).not.toHaveBeenCalled();
    const restarted = jest.fn();
    service.animateNumber(10, 2, restarted);
    expect(restarted).toHaveBeenLastCalledWith(0);
    test.tick(4000);
    expect(restarted).toHaveBeenLastCalledWith(10);
  });

  test.each([0, -1, NaN, Infinity])('rejects invalid duration %s without scheduling', (duration) => {
    const test = scheduler();
    const service = new AnimationService(test.clock);
    expect(() => service.animateNumber(10, duration, jest.fn())).toThrow();
    expect(service.isAnimating).toBe(false);
    expect(test.pending()).toBe(0);
  });
});
