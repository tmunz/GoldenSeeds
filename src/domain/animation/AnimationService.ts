export const DEFAULT_ANIMATION_SECONDS = 2;

export interface AnimationScheduler {
  now: () => number;
  request: (callback: (time: number) => void) => number;
  cancel: (id: number) => void;
}

const browserScheduler: AnimationScheduler = {
  now: () => performance.now(),
  request: (callback) => requestAnimationFrame(callback),
  cancel: (id) => cancelAnimationFrame(id),
};

/** Linear, cancellable number playback, independent of configuration and rendering. */
export class AnimationService {
  private active = new Set<() => void>();

  constructor(private scheduler: AnimationScheduler = browserScheduler) {}

  get isAnimating(): boolean { return this.active.size > 0; }

  animateNumber(target: number, seconds: number, update: (value: number) => void, complete?: () => void): () => void {
    if (!Number.isFinite(target) || !Number.isFinite(seconds) || seconds <= 0) {
      throw new Error('Animation requires a finite target and a positive duration');
    }
    const start = this.scheduler.now();
    let frame: number | undefined;
    let running = true;
    const cancel = () => {
      running = false;
      if (frame !== undefined) { this.scheduler.cancel(frame); }
      this.active.delete(cancel);
    };
    const tick = (time: number) => {
      if (!running) { return; }
      const progress = Math.max(0, Math.min(1, (time - start) / (seconds * 1000)));
      update(target * progress);
      if (!running) { return; }
      if (progress === 1) {
        running = false;
        this.active.delete(cancel);
        complete?.();
      } else {
        frame = this.scheduler.request(tick);
      }
    };
    this.active.add(cancel);
    update(0);
    if (running) { frame = this.scheduler.request(tick); }
    return cancel;
  }
}

export const animationService = new AnimationService();
