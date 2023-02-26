import { AnimationUtils } from "../../utils/AnimationUtils";
import { configService } from "../ConfigService";

export class AnimationService {
  private static START_VALUE = 0;
  private static INTERVAL = 40;

  private animation: any; // Interval

  currentValue?: number;

  animate = (stageId: string, id: string, target: number) => {
    const doesNotInterfereWithRunningAnimation = typeof this.currentValue === 'undefined';

    if (doesNotInterfereWithRunningAnimation) {

      const start = new Date().getTime();
      this.animation = setInterval(() => {
        const frame = (new Date().getTime() - start) / AnimationService.INTERVAL;
        const raw = AnimationUtils.easeInOut(
          AnimationService.START_VALUE,
          target,
          frame,
          100,
        );
        const value: number = Math.max(0, Math.min(target, Math.round(raw)));
        configService.setAnimationValue(stageId, id, "" + value);
        const isComplete = target <= value;
        this.currentValue = isComplete ? undefined : value;
        if (isComplete) {
          clearInterval(this.animation);
          this.currentValue = undefined;
          configService.setAnimationValue(stageId);
        }
      }, AnimationService.INTERVAL);
    }
  };

  animateDefault() {
    root:
    for (const stage of configService.config$.value.stages) {
      for (const [key, value] of Object.entries(stage.generator.definition)) {
        if (value.animateable) {
          console.log(stage.id, key, stage.state[key].value);
          this.animate(stage.id, key, stage.state[key].value);
          break root;
        }
      };
    };
  }

}

export const animationService = new AnimationService();
