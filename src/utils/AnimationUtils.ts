import { MathUtils } from './MathUtils';

export class AnimationUtils {
    
  static easeInOut(from: number, target: number, t: number, duration: number): number {
    const exp = MathUtils.goldenRatio * 10 * (t / MathUtils.goldenRatio / duration - 0.5); // magic numbers
    const r = Math.pow(2, exp);
    return from + (target - from) * (exp < 0 ? 0.6 * r : 1 - (0.5 / r) + 0.1);
  }
  
}
