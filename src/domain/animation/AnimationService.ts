import { AnimationUtils } from '../../utils/AnimationUtils';
import { configService } from '../config/ConfigService';

export class AnimationService {
  private static START_VALUE = 1;
  private static DURATION = 2000;

  isAnimating = false;

  animate = (stageId: string, id: string, target: number) => {
    if (!this.isAnimating) {
      this.isAnimating = true;
      configService.setAnimationValue(
        stageId,
        id,
        '' + AnimationService.START_VALUE,
      );
      const tStart = new Date().getTime();
      this.animateHelper(stageId, id, target, tStart);
    }
  };

  animateDefault() {
    root: for (const stage of configService.config$.value.stages) {
      for (const [key, value] of Object.entries(stage.generator.definition)) {
        if (value.animateable) {
          this.animate(stage.id, key, stage.state[key].value);
          break root;
        }
      }
    }
  }

  private animateHelper = (
    stageId: string,
    id: string,
    target: number,
    tStart: number,
  ) => {
    const t = new Date().getTime() - tStart;
    const progress = t / AnimationService.DURATION;
    const raw = AnimationUtils.easeInOut(
      AnimationService.START_VALUE,
      target,
      progress,
    );
    const value: number = Math.max(0, Math.min(target, Math.round(raw)));
    configService.setAnimationValue(stageId, id, '' + value);
    const isComplete = target <= value;
    if (isComplete) {
      this.isAnimating = false;
      configService.setAnimationValue(stageId);
    } else {
      requestAnimationFrame(() =>
        this.animateHelper(stageId, id, target, tStart),
      );
    }
  };
}

export const animationService = new AnimationService();
