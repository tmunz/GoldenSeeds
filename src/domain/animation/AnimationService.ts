export class AnimationService {
  isAnimating = false;

  /**
   * Intro animation hook, run once after the first "real" config loads (see App.tsx). It used
   * to reach directly into the legacy per-stage config state to animate a single numeric
   * parameter up from a start value. Parameters now live on separate, freely connectable
   * value nodes (see ValueNodeRegistry) rendered by GraphCanvas's own internal React state,
   * so there's no external hook to drive that animation from here anymore - this is currently
   * a no-op.
   */
  animateDefault() {
    // no-op - see class doc comment
  }
}

export const animationService = new AnimationService();

