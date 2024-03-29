export class AnimationUtils {
  static easeInOut(from: number, target: number, progress: number): number {
    const exp = 16 * (progress - 0.5); // magic numbers
    const r = Math.pow(2, exp);
    return from + (target - from) * (exp < 0 ? 0.6 * r : 1 - 0.5 / r + 0.1);
  }
}
